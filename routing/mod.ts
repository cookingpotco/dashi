import { parseRoutesDir } from "../fs/mod.ts";
import { renderRoute } from "../ssr/mod.ts";

export async function serveFileBased() {
  const rootDir = Deno.mainModule.replace(/\/[^\/]*$/, "");
  const routesDir = `${rootDir}/routes/`;

  const paths = await parseRoutesDir({ dir: routesDir });

  Deno.serve(async (req) => {
    if (req.url.match("favicon.ico")) {
      return new Response();
    }

    const matched = paths.find((path) => !!path.pattern.exec(req.url));

    if (matched) {
      matched.middlewares.forEach(async (m) => await m.preRender?.(req));
      const html = await renderRoute(
        matched.layouts,
        matched.route,
      );

      const text = `<!DOCTYPE html>${html}`;
      const res = new Response(text);
      res.headers.set("Content-Type", "text/html");
      console.log(`Served: ${text}`);

      matched.middlewares.forEach(async (m) => await m.postRender?.(res));

      return res;
    }

    return new Response("Not found", { status: 404 });
  });
}
