import { REQUEST_HEADERS } from "../shared/mod.ts";
import { RoutingPath } from "../shared/shared_types.ts";
import {
  renderRoute,
  RenderStorage,
  replaceFragmentSlots,
} from "../ssr/mod.ts";

let paths: RoutingPath[];

interface InternalHandleOptions {
  nested?: boolean;
}

async function internalHandle(
  req: Request,
  options: InternalHandleOptions = {},
): Promise<{ html: string; res: Response } | null> {
  // TODO: Error handling
  const matched = paths.find((path) => !!path.pattern.exec(req.url));
  const isFragment = req.headers.has(REQUEST_HEADERS.FRAGMENT);

  if (!options.nested) {
    RenderStorage.getInstance().init(req);
  }

  if (matched) {
    matched.middlewares.forEach(async (m) => await m.preRender?.(req));
    let html = String(
      await renderRoute(
        matched.route,
        {
          req: req,
          layouts: matched.layouts,
        },
      ),
    );

    if (!options.nested) {
      // TODO(COO-38): eager fragment substitution over real HTTP
      html = await replaceFragmentSlots(html);
    }

    // TODO: Better way to handle content type and DOCTYPE
    const text = isFragment ? html : `<!DOCTYPE html>${html}`;
    const res = new Response(text);
    res.headers.set("Content-Type", "text/html");
    // TODO: Remove log
    // add not found handling
    console.log(`Served: ${text}`);

    matched.middlewares.forEach(async (m) => await m.postRender?.(res));

    return { html: html, res };
  }

  return null;
}

export function init(p: RoutingPath[]) {
  paths = p;
}

export async function handle(
  req: Request,
) {
  // TODO: Remove hardcoded stuff
  if (req.url.match("favicon.ico")) {
    return new Response();
  }

  const result = await internalHandle(req);

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  return result.res;
}

export function requestEagerFragment(src: string) {
  const ctx = RenderStorage.getInstance();

  if (!ctx.req) {
    throw new Error("RenderStorage wasn't properly initialized, missing `req`");
  }

  if (ctx.hasFragment(src)) {
    return;
  }

  const url = new URL(src, ctx.req.url);
  const headers = new Headers();
  const cookie = ctx.req.headers.get("cookie");
  const authorization = ctx.req.headers.get("authorization");
  if (cookie !== null) {
    headers.set("cookie", cookie);
  }
  if (authorization !== null) {
    headers.set("authorization", authorization);
  }
  headers.set(REQUEST_HEADERS.FRAGMENT, "1");

  const nestedReq = new Request(url, { method: "GET", headers });
  const promise = internalHandle(nestedReq, { nested: true }).then((
    res,
  ) => res ? res.html : res);

  ctx.addFragment(src, promise);
}
