import { Route } from "./route.ts";

export async function serveFileBased() {
  const rootDir = Deno.mainModule.replace(/\/[^\/]*$/, "");
  const routesDir = `${rootDir}/site/`;

  const paths: { route: Route; pattern: URLPattern }[] = [];

  // TODO: Add proper error handling for this
  for await (const dirEntry of Deno.readDir(new URL(routesDir))) {
    if (dirEntry.isFile && dirEntry.name === "route.tsx") {
      const route = await import(`${routesDir}/${dirEntry.name}`);

      // TODO: Add validation for files
      console.log(route);
      const routeClass = route[Object.keys(route)[0]];
      paths.push({
        route: new routeClass(),
        pattern: new URLPattern({ pathname: "/" }),
      });
      // TODO: Add other file types, middleware, layout
    }
  }

  Deno.serve(async (req) => {
    const url = new URL(req.url);

    if (req.url.match("favicon.ico")) {
      return new Response();
    }
    const query: Record<string, string> = {};
    url.searchParams.forEach((k, v) => query[k] = v);

    const matched = paths.find((path) => !!path.pattern.exec(req.url));

    // TODO: Don't match twice
    const match = matched?.pattern.exec(req.url);

    if (match) {
      const text = `<!DOCTYPE html>${await matched?.route.render?.()}`;
      const res = new Response(text);
      res.headers.set("Content-Type", "text/html");
      console.log(`Served: ${text}`);

      return res;
    }

    return new Response("Not found", { status: 404 });
  });
}

export { type Route } from "./route.ts";
