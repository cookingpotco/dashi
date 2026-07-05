import { REQUEST_HEADERS } from "../shared/mod.ts";
import { RoutingPath } from "../shared/shared_types.ts";
import { renderRoute, RenderStorage } from "../ssr/mod.ts";

let paths: RoutingPath[];

interface InternalHandleOptions {
  inlineFragment?: boolean;
}

async function internalHandle(
  req: Request,
  options: InternalHandleOptions = {},
): Promise<{ html: string; res: Response } | null> {
  // TODO: Error handling
  const matched = paths.find((path) => !!path.pattern.exec(req.url));
  const isFragment = req.headers.has(REQUEST_HEADERS.FRAGMENT) ||
    options.inlineFragment;

  // TODO: Use custom storage for this
  // req.inlineFragment = inlineFragment;

  if (!options.inlineFragment) {
    RenderStorage.getInstance().init(req);
  }

  if (matched) {
    matched.middlewares.forEach(async (m) => await m.preRender?.(req));
    const html = await renderRoute(
      matched.route,
      {
        req: req,
        layouts: matched.layouts,
        inlineFragment: options.inlineFragment,
      },
    );

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

export function requestInlineFragment(req: Request, src: string) {
  const ctx = RenderStorage.getInstance();

  if (ctx.hasFragment(src)) {
    return;
  }

  const promise = internalHandle(req, { inlineFragment: true }).then((res) =>
    res ? res.html : res
  );

  ctx.addFragment(src, promise);
}
