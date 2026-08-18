import { type Ctx, REQUEST_HEADERS } from "../shared/mod.ts";
import { info } from "../logging/mod.ts";
import {
  compile,
  type CompiledTable,
  flatten,
  match,
  type RouteTable,
} from "./path.ts";
import {
  getRenderStore,
  renderRoute,
  replaceFragmentSlots,
  runWithRenderStore,
} from "../ssr/mod.ts";

export {
  type Group,
  group,
  type ParamsOf,
  type Route,
  route,
  type RouteTable,
} from "./path.ts";

let compiled: CompiledTable = { staticByPath: new Map(), dynamic: [] };

function createCtx(options: {
  req: Request;
  params: Record<string, string>;
  isFragment: boolean;
  state: Record<string, unknown>;
}): Ctx<Record<string, string>, Record<string, unknown>> {
  return {
    req: options.req,
    url: new URL(options.req.url),
    params: options.params,
    isFragment: options.isFragment,
    state: options.state,
  };
}

async function runRoute(
  req: Request,
  isFragment: boolean,
  state: Record<string, unknown>,
): Promise<{ html: string | undefined; res: Response } | null> {
  const matched = match(compiled, new URL(req.url).pathname);
  if (!matched) {
    return null;
  }

  const ctx = createCtx({
    req,
    params: matched.params,
    isFragment,
    state,
  });

  const store = getRenderStore();
  const previousState = store.currentState;
  store.currentState = ctx.state;

  try {
    let html: string | undefined;
    const terminal = async () => {
      html = String(
        await renderRoute(matched.handler, {
          ctx,
          layouts: matched.layouts,
        }),
      );
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
  } finally {
    store.currentState = previousState;
  }
}

export function init<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(table: RouteTable<State>) {
  const routes = flatten(table);
  compiled = compile(routes);
  for (const r of routes) {
    info(`[ROUTE]      ${r.path}`);
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
    const result = await runRoute(req, isFragment, {});
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
  const promise = runRoute(req, true, { ...store.currentState }).then(
    (result) => result?.html ?? null,
  );

  store.inflightFragments.set(src, promise);
}
