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
import {
  htmlResponse,
  lastResort,
  recover,
  type RouteResult,
} from "./recover.ts";
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

async function runHandlerTerminal(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  matched: MatchedRoute<Record<string, unknown>>,
): Promise<RouteResult> {
  const method = ctx.req.method;
  const handler = isMethod(method) ? matched.handlers[method] : undefined;
  if (!handler) {
    return { html: undefined, res: methodNotAllowed(matched.handlers) };
  }

  let page;
  try {
    const out = await handler(ctx);
    if (out instanceof Response) {
      return { html: undefined, res: out };
    }
    page = out;
  } catch (thrown) {
    return await recover(
      thrown,
      matched.boundary,
      ctx,
      compiled.errorFallback,
    );
  }

  if (ctx.isFragment) {
    const html = String(page);
    return { html, res: htmlResponse(html, 200) };
  }

  const wrapped = await renderBoundaries(page, {
    ctx,
    boundary: matched.boundary,
  });
  if ("thrown" in wrapped) {
    return await recover(
      wrapped.thrown,
      wrapped.parent,
      ctx,
      compiled.errorFallback,
    );
  }

  const html = String(wrapped.page);
  return { html, res: htmlResponse(`<!DOCTYPE html>${html}`, 200) };
}

async function runNotFoundTerminal(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
): Promise<RouteResult> {
  const boundary = rootBoundary();
  let page;
  try {
    const notFound = compiled.notFound;
    if (!notFound) {
      return {
        html: undefined,
        res: new Response(DEFAULT_NOT_FOUND_BODY, { status: 404 }),
      };
    }
    const out = await notFound(ctx);
    if (out instanceof Response) {
      return { html: undefined, res: out };
    }
    page = out;
  } catch (thrown) {
    return await recover(thrown, boundary, ctx, compiled.errorFallback);
  }

  if (ctx.isFragment) {
    return { html: undefined, res: new Response("", { status: 404 }) };
  }

  const wrapped = await renderBoundaries(page, { ctx, boundary });
  if ("thrown" in wrapped) {
    return await recover(
      wrapped.thrown,
      wrapped.parent,
      ctx,
      compiled.errorFallback,
    );
  }

  const html = String(wrapped.page);
  return { html, res: htmlResponse(`<!DOCTYPE html>${html}`, 404) };
}

async function runPipeline(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  middleware: MatchedRoute<Record<string, unknown>>["middleware"],
  runTerminal: () => Promise<RouteResult>,
): Promise<RouteResult> {
  return await runWithNestedRenderStore(ctx.state, async () => {
    let result: RouteResult | undefined;
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
      result = await runTerminal();
      return new Response(result.res.body, result.res);
    };
    const res = await dispatch(0);
    return { html: result?.html, res };
  });
}

async function runRoute(
  table: CompiledTable<Record<string, unknown>>,
  req: Request,
  isFragment: boolean,
  state: Partial<Record<string, unknown>>,
  recoverMiss: boolean,
): Promise<RouteResult | null> {
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
      const result = await runRoute(compiled, req, isFragment, {}, true);
      if (!result || result.html === undefined) {
        return result?.res ?? lastResort(isFragment, compiled.errorFallback);
      }
      const html = await replaceFragmentSlots(result.html);
      const text = isFragment ? html : `<!DOCTYPE html>${html}`;
      return new Response(text, {
        status: result.res.status,
        headers: result.res.headers,
      });
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
  const promise = runRoute(
    compiled,
    req,
    true,
    { ...store.currentState },
    false,
  )
    .then((result) => result?.html ?? null)
    .catch((thrown) => {
      logError(thrown);
      return null;
    });

  store.inflightFragments.set(src, promise);
}
