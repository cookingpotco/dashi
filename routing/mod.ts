import { REQUEST_HEADERS } from "../shared/mod.ts";
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

async function runRoute(
  req: Request,
  isFragment: boolean,
): Promise<{ html: string | undefined; res: Response } | null> {
  const matched = match(compiled, new URL(req.url).pathname);
  if (!matched) {
    return null;
  }

  let html: string | undefined;
  const terminal = async () => {
    html = String(
      await renderRoute(matched.handler, {
        req,
        layouts: matched.layouts,
        params: matched.params,
        isFragment,
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
    return await mw(req, () => dispatch(i + 1));
  };

  const res = await dispatch(0);
  return { html, res };
}

export function init(table: RouteTable) {
  const routes = flatten(table);
  compiled = compile(routes);
  for (const r of routes) {
    info(`[ROUTE]      ${r.path}`);
  }
}

export async function handle(
  incoming: Request,
) {
  // TODO: Remove hardcoded stuff
  if (incoming.url.match("favicon.ico")) {
    return new Response();
  }

  // Incoming Fetch headers are immutable; middleware stamps values the handler reads.
  // TODO(COO-13): drop the clone; mutable request data will live on ctx.state.
  const req = new Request(incoming);

  return await runWithRenderStore(req, async () => {
    const isFragment = req.headers.has(REQUEST_HEADERS.FRAGMENT);
    const result = await runRoute(req, isFragment);
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

  const url = new URL(src, store.req.url);
  const headers = new Headers();
  const cookie = store.req.headers.get("cookie");
  const authorization = store.req.headers.get("authorization");
  if (cookie !== null) {
    headers.set("cookie", cookie);
  }
  if (authorization !== null) {
    headers.set("authorization", authorization);
  }

  const req = new Request(url, { method: "GET", headers });
  const promise = runRoute(req, true).then((result) => result?.html ?? null);

  store.inflightFragments.set(src, promise);
}
