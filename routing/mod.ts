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
  flatten,
  type GroupBoundary,
  match,
  type MatchedRoute,
  type ServeTable,
} from "./path.ts";
import { htmlResponse, lastResort, recover } from "./recover.ts";
import {
  getRenderStore,
  renderBoundaries,
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
} from "./path.ts";

const DEFAULT_NOT_FOUND_BODY = "Not found";

let compiled: CompiledTable<Record<string, unknown>> = {
  staticByPath: new Map(),
  dynamic: [],
  rootLayouts: [],
  rootMiddleware: [],
};

function isMethod(method: string): method is Method {
  return (METHODS as readonly string[]).includes(method);
}

function methodNotAllowed(
  handlers: { readonly [M in Method]?: unknown },
): Response {
  const allow = METHODS.filter((method) => handlers[method]).join(", ");
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: allow },
  });
}

function createCtx<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(options: {
  req: Request;
  params: Record<string, string>;
  isFragment: boolean;
  state: Partial<State>;
}): Ctx<Record<string, string>, State> {
  return {
    req: options.req,
    url: new URL(options.req.url),
    params: options.params,
    isFragment: options.isFragment,
    state: options.state,
  };
}

function rootBoundary(): GroupBoundary<Record<string, unknown>> {
  return { layouts: compiled.rootLayouts, error: compiled.rootError };
}

async function pageResponse(
  out: Element | Response,
  status: number,
  isFragment: boolean,
): Promise<Response> {
  if (out instanceof Response) {
    return out;
  }
  const html = await replaceFragmentSlots(String(out));
  return htmlResponse(
    isFragment ? html : `<!DOCTYPE html>${html}`,
    status,
  );
}

async function runHandler(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  matched: MatchedRoute<Record<string, unknown>>,
): Promise<Element | Response> {
  const method = ctx.req.method;
  const handler = isMethod(method) ? matched.handlers[method] : undefined;
  if (!handler) {
    return methodNotAllowed(matched.handlers);
  }

  try {
    return await handler(ctx);
  } catch (thrown) {
    return await recover(
      thrown,
      matched.boundary,
      ctx,
      compiled.errorFallback,
    );
  }
}

async function runHandlerTerminal(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  matched: MatchedRoute<Record<string, unknown>>,
): Promise<Response> {
  const method = ctx.req.method;
  const handler = isMethod(method) ? matched.handlers[method] : undefined;
  if (!handler) {
    return methodNotAllowed(matched.handlers);
  }

  try {
    const out = await handler(ctx);
    if (out instanceof Response) {
      return out;
    }
    if (ctx.isFragment) {
      return await pageResponse(out, 200, true);
    }
    const wrapped = await renderBoundaries(out, {
      ctx,
      boundary: matched.boundary,
    });
    if ("thrown" in wrapped) {
      return await pageResponse(
        await recover(
          wrapped.thrown,
          wrapped.parent,
          ctx,
          compiled.errorFallback,
        ),
        500,
        false,
      );
    }
    return await pageResponse(wrapped.page, 200, false);
  } catch (thrown) {
    return await pageResponse(
      await recover(
        thrown,
        matched.boundary,
        ctx,
        compiled.errorFallback,
      ),
      500,
      ctx.isFragment,
    );
  }
}

async function runNotFoundTerminal(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
): Promise<Response> {
  const boundary = rootBoundary();
  try {
    const notFound = compiled.notFound;
    if (!notFound) {
      return new Response(DEFAULT_NOT_FOUND_BODY, { status: 404 });
    }
    const out = await notFound(ctx);
    if (out instanceof Response) {
      return out;
    }
    if (ctx.isFragment) {
      return new Response("", { status: 404 });
    }
    const wrapped = await renderBoundaries(out, { ctx, boundary });
    if ("thrown" in wrapped) {
      return await pageResponse(
        await recover(
          wrapped.thrown,
          wrapped.parent,
          ctx,
          compiled.errorFallback,
        ),
        500,
        false,
      );
    }
    return await pageResponse(wrapped.page, 404, false);
  } catch (thrown) {
    return await pageResponse(
      await recover(thrown, boundary, ctx, compiled.errorFallback),
      500,
      ctx.isFragment,
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
  isFragment: boolean,
  state: Partial<Record<string, unknown>>,
  recoverMiss: boolean,
): Promise<Response | null> {
  const matched = match(table, new URL(req.url).pathname);
  if (!matched) {
    if (!recoverMiss) {
      return null;
    }
    const ctx = createCtx({
      req,
      params: {},
      isFragment,
      state,
    });
    return await runPipeline(
      ctx,
      table.rootMiddleware,
      () => runNotFoundTerminal(ctx),
    );
  }

  const ctx = createCtx({
    req,
    params: matched.params,
    isFragment,
    state,
  });
  return await runPipeline(
    ctx,
    matched.middleware,
    () => runHandlerTerminal(ctx, matched),
  );
}

export function init<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(table: ServeTable<State>) {
  const routes = flatten(table);
  // handle() has no State parameter. The table is only invoked with a ctx
  // whose state bag is the object createCtx received.
  compiled = {
    ...compile(routes),
    rootLayouts: table.layouts ?? [],
    rootMiddleware: table.middleware ?? [],
    rootError: table.error,
    notFound: table.notFound,
    errorFallback: table.errorFallback,
  } as CompiledTable<Record<string, unknown>>;
  for (const r of routes) {
    const methods = METHODS.filter((method) => r.handlers[method]).join(",");
    info(`[ROUTE]      ${methods} ${r.path}`);
  }
}

export async function handle(
  req: Request,
) {
  // TODO: Remove hardcoded stuff
  if (req.url.match("favicon.ico")) {
    return new Response();
  }

  return await runWithRenderStore(req, async () => {
    const isFragment = req.headers.has(REQUEST_HEADERS.FRAGMENT);
    try {
      return await runRoute(compiled, req, isFragment, {}, true) ??
        lastResort(isFragment, compiled.errorFallback);
    } catch (thrown) {
      logError(thrown);
      return lastResort(isFragment, compiled.errorFallback);
    }
  });
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
    const ctx = createCtx({
      req,
      params: matched.params,
      isFragment: true,
      state: { ...store.currentState },
    });
    let page: Element | Response | undefined;
    try {
      await runPipeline(ctx, matched.middleware, async () => {
        page = await runHandler(ctx, matched);
        if (page instanceof Response) {
          return page;
        }
        return htmlResponse(String(page), 200);
      });
    } catch (thrown) {
      logError(thrown);
      return null;
    }
    if (page == null || page instanceof Response) {
      return null;
    }
    return String(page);
  })();

  store.inflightFragments.set(src, promise);
}
