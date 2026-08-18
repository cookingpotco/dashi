import { type Ctx, REQUEST_HEADERS } from "../shared/mod.ts";
import { info } from "../logging/mod.ts";
import {
  compile,
  type CompiledTable,
  flatten,
  match,
  type Method,
  METHODS,
  type RouteTable,
} from "./path.ts";
import {
  getRenderStore,
  renderRoute,
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
} from "./path.ts";

let compiled: CompiledTable<Record<string, unknown>> = {
  staticByPath: new Map(),
  dynamic: [],
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

async function runRoute<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  table: CompiledTable<State>,
  req: Request,
  isFragment: boolean,
  state: Partial<State>,
): Promise<{ html: string | undefined; res: Response } | null> {
  const matched = match(table, new URL(req.url).pathname);
  if (!matched) {
    return null;
  }

  const ctx = createCtx({
    req,
    params: matched.params,
    isFragment,
    state,
  });

  return await runWithNestedRenderStore(ctx.state, async () => {
    let html: string | undefined;
    const terminal = async () => {
      const method = ctx.req.method;
      const handler = isMethod(method) ? matched.handlers[method] : undefined;
      if (!handler) {
        return methodNotAllowed(matched.handlers);
      }

      const rendered = await renderRoute(handler, {
        ctx,
        layouts: matched.layouts,
      });
      if (rendered instanceof Response) {
        return rendered;
      }

      html = String(rendered);
      const text = isFragment ? html : `<!DOCTYPE html>${html}`;
      const res = new Response(text);
      res.headers.set("Content-Type", "text/html");
      return res;
    };

    let index = -1;
    const dispatch = async (i: number): Promise<Response> => {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      const mw = matched.middleware[i];
      if (!mw) {
        return terminal();
      }
      return await mw(ctx, () => dispatch(i + 1));
    };

    const res = await dispatch(0);
    return { html, res };
  });
}

export function init<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(table: RouteTable<State>) {
  const routes = flatten(table);
  // handle() has no State parameter. The table is only invoked with a ctx
  // whose state bag is the object createCtx received.
  compiled = compile(routes) as CompiledTable<Record<string, unknown>>;
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
    const result = await runRoute(compiled, req, isFragment, {});
    if (!result) {
      return new Response("Not found", { status: 404 });
    }
    if (result.html === undefined) {
      return result.res;
    }
    const html = await replaceFragmentSlots(result.html);
    const text = isFragment ? html : `<!DOCTYPE html>${html}`;
    return new Response(text, {
      status: result.res.status,
      headers: result.res.headers,
    });
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
  const promise = runRoute(compiled, req, true, { ...store.currentState })
    .then((result) => result?.html ?? null);

  store.inflightFragments.set(src, promise);
}
