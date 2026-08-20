import { type Element } from "../jsx-runtime/jsx_types.ts";
import { error as logError, info } from "../logging/mod.ts";
import {
  type Ctx,
  type Method,
  METHODS,
  REQUEST_HEADERS,
} from "../shared/mod.ts";
import {
  compile,
  type CompiledTable,
  match,
  type MatchedRoute,
  type ServeTable,
} from "./table.ts";
import { lastResort, recover } from "./recovery.ts";
import {
  getRenderStore,
  renderBoundaries,
  RenderKind,
  replaceFragmentSlots,
  runWithNestedRenderStore,
  runWithRenderStore,
} from "../ssr/mod.ts";

export {
  type Group,
  group,
  type Method,
  type MethodHandlers,
  type ParamsOf,
  type Route,
  route,
  type RouteTable,
  type ServeTable,
} from "./table.ts";

const DEFAULT_NOT_FOUND_BODY = "Not found";

let compiled: CompiledTable<Record<string, unknown>> = {
  staticByPath: new Map(),
  dynamic: [],
  rootBoundary: { layouts: [] },
  rootMiddleware: [],
};

function isMethod(method: string): method is Method {
  return (METHODS as readonly string[]).includes(method);
}

function advertisedMethods(
  handlers: { readonly [M in Exclude<Method, "HEAD">]?: unknown },
): string[] {
  const listed: string[] = [];
  for (const method of METHODS) {
    if (method === "HEAD") {
      if (handlers.GET) {
        listed.push(method);
      }
      continue;
    }
    if (handlers[method]) {
      listed.push(method);
    }
  }
  return listed;
}

function methodNotAllowed(
  handlers: { readonly [M in Exclude<Method, "HEAD">]?: unknown },
): Response {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: advertisedMethods(handlers).join(", ") },
  });
}

async function withoutContent(res: Response): Promise<Response> {
  const headers = new Headers(res.headers);
  await res.body?.cancel();
  return new Response(null, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

async function routeResponse(
  out: Element | Response,
  options: { status: number; isFragment: boolean },
): Promise<Response> {
  if (out instanceof Response) {
    return out;
  }
  const html = await replaceFragmentSlots(String(out));
  const body = options.isFragment ? html : `<!DOCTYPE html>${html}`;
  const bytes = new TextEncoder().encode(body);
  const res = new Response(bytes, { status: options.status });
  res.headers.set("Content-Type", "text/html");
  res.headers.set("Content-Length", String(bytes.byteLength));
  return res;
}

async function runHandler(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  matched: MatchedRoute<Record<string, unknown>>,
): Promise<Element | Response> {
  const method = ctx.req.method;
  let handler;
  if (method === "HEAD") {
    handler = matched.handlers.GET;
  } else if (isMethod(method) && method !== "HEAD") {
    handler = matched.handlers[method];
  }
  if (!handler) {
    return methodNotAllowed(matched.handlers);
  }
  return await handler(ctx);
}

async function runHandlerTerminal(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  matched: MatchedRoute<Record<string, unknown>>,
): Promise<Response> {
  try {
    const out = await runHandler(ctx, matched);
    if (out instanceof Response) {
      return out;
    }
    if (ctx.isFragment) {
      return await routeResponse(out, { status: 200, isFragment: true });
    }
    const wrapped = await renderBoundaries(out, {
      ctx,
      boundary: matched.boundary,
    });
    if (wrapped.kind === RenderKind.Thrown) {
      return await routeResponse(
        await recover(
          wrapped.thrown,
          wrapped.parent,
          ctx,
          compiled.errorFallback,
        ),
        { status: 500, isFragment: false },
      );
    }
    return await routeResponse(wrapped.page, {
      status: 200,
      isFragment: false,
    });
  } catch (thrown) {
    return await routeResponse(
      await recover(
        thrown,
        matched.boundary,
        ctx,
        compiled.errorFallback,
      ),
      { status: 500, isFragment: ctx.isFragment },
    );
  }
}

async function runNotFoundTerminal(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
): Promise<Response> {
  if (ctx.isFragment) {
    return new Response("", { status: 404 });
  }
  const boundary = compiled.rootBoundary;
  try {
    const notFound = compiled.notFound;
    if (!notFound) {
      return new Response(DEFAULT_NOT_FOUND_BODY, { status: 404 });
    }
    const out = await notFound(ctx);
    if (out instanceof Response) {
      return out;
    }
    const wrapped = await renderBoundaries(out, { ctx, boundary });
    if (wrapped.kind === RenderKind.Thrown) {
      return await routeResponse(
        await recover(
          wrapped.thrown,
          wrapped.parent,
          ctx,
          compiled.errorFallback,
        ),
        { status: 500, isFragment: false },
      );
    }
    return await routeResponse(wrapped.page, {
      status: 404,
      isFragment: false,
    });
  } catch (thrown) {
    return await routeResponse(
      await recover(thrown, boundary, ctx, compiled.errorFallback),
      { status: 500, isFragment: false },
    );
  }
}

async function runPipeline(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  middleware: MatchedRoute<Record<string, unknown>>["middleware"],
  runTerminal: () => Promise<Response>,
): Promise<Response> {
  return await runWithNestedRenderStore(ctx.state, async () => {
    let index = -1;
    const dispatch = async (i: number): Promise<Response> => {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      const mw = middleware[i];
      if (mw) {
        const res = await mw(ctx, () => dispatch(i + 1));
        return new Response(res.body, res);
      }
      const res = await runTerminal();
      return new Response(res.body, res);
    };
    return await dispatch(0);
  });
}

async function runRoute(
  table: CompiledTable<Record<string, unknown>>,
  req: Request,
  options: {
    isFragment: boolean;
    state: Partial<Record<string, unknown>>;
    recoverMiss: boolean;
  },
): Promise<Response | null> {
  const matched = match(table, new URL(req.url).pathname);
  if (!matched) {
    if (!options.recoverMiss) {
      return null;
    }
    const ctx: Ctx<Record<string, string>, Record<string, unknown>> = {
      req,
      url: new URL(req.url),
      params: {},
      isFragment: options.isFragment,
      state: options.state,
    };
    return await runPipeline(
      ctx,
      table.rootMiddleware,
      () => runNotFoundTerminal(ctx),
    );
  }

  const ctx: Ctx<Record<string, string>, Record<string, unknown>> = {
    req,
    url: new URL(req.url),
    params: matched.params,
    isFragment: options.isFragment,
    state: options.state,
  };
  return await runPipeline(
    ctx,
    matched.middleware,
    () => runHandlerTerminal(ctx, matched),
  );
}

export function init<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(table: ServeTable<State>) {
  // handle() has no State parameter. The table is only invoked with a ctx
  // whose state bag is the object the request created.
  compiled = compile(table) as CompiledTable<Record<string, unknown>>;
  const declared = [
    ...compiled.staticByPath.values(),
    ...compiled.dynamic,
  ].sort((a, b) => a.declarationIndex - b.declarationIndex);
  let prev = -1;
  for (const r of declared) {
    if (r.declarationIndex === prev) {
      continue;
    }
    prev = r.declarationIndex;
    const methods = advertisedMethods(r.handlers).join(",");
    info(`[ROUTE]      ${methods} ${r.path}`);
  }
}

export async function handle(
  req: Request,
) {
  const res = await runWithRenderStore(req, async () => {
    const isFragment = req.headers.has(REQUEST_HEADERS.FRAGMENT);
    try {
      const out = await runRoute(compiled, req, {
        isFragment,
        state: {},
        recoverMiss: true,
      });
      if (out) {
        return out;
      }
      return await routeResponse(
        lastResort({
          isFragment,
          errorFallback: compiled.errorFallback,
        }),
        { status: 500, isFragment },
      );
    } catch (thrown) {
      logError(thrown);
      return await routeResponse(
        lastResort({
          isFragment,
          errorFallback: compiled.errorFallback,
        }),
        { status: 500, isFragment },
      );
    }
  });
  if (req.method === "HEAD") {
    return await withoutContent(res);
  }
  return res;
}

export function requestEagerFragment(src: string) {
  const store = getRenderStore();

  if (store.inflightFragments.has(src)) {
    return;
  }

  const url = new URL(src, store.pageReq.url);
  const headers = new Headers();
  const cookie = store.pageReq.headers.get("cookie");
  const authorization = store.pageReq.headers.get("authorization");
  if (cookie !== null) {
    headers.set("cookie", cookie);
  }
  if (authorization !== null) {
    headers.set("authorization", authorization);
  }

  const req = new Request(url, { method: "GET", headers });
  const matched = match(compiled, url.pathname);
  const promise = (async (): Promise<string | null> => {
    if (!matched) {
      return null;
    }
    const ctx: Ctx<Record<string, string>, Record<string, unknown>> = {
      req,
      url: new URL(req.url),
      params: matched.params,
      isFragment: true,
      state: { ...store.currentState },
    };
    let html: string | null = null;
    try {
      await runPipeline(ctx, matched.middleware, async () => {
        let out: Element | Response;
        let status = 200;
        try {
          out = await runHandler(ctx, matched);
        } catch (thrown) {
          out = await recover(
            thrown,
            matched.boundary,
            ctx,
            compiled.errorFallback,
          );
          status = 500;
        }
        if (out instanceof Response) {
          return out;
        }
        html = String(out);
        const res = new Response(html, { status });
        res.headers.set("Content-Type", "text/html");
        return res;
      });
    } catch (thrown) {
      logError(thrown);
      return null;
    }
    return html;
  })();

  store.inflightFragments.set(src, promise);
}
