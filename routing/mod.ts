import { SaffronNode } from "../jsx-runtime/jsx_types.ts";

export interface Route {
  render(): Promise<SaffronNode> | SaffronNode;
}

export interface Layout {
  render(
    children: SaffronNode,
  ): Promise<SaffronNode> | SaffronNode;
}

export interface Middleware {
  preRender?: (
    req: Request,
  ) => void | Promise<void>;
  postRender?: (res: Response) => void | Promise<void>;
}

interface FsPath {
  route: Route;
  pattern: URLPattern;
  layouts: Layout[];
  middlewares: Middleware[];
}

type Constructor<T> = new () => T;

function getModuleInstance<T>(
  mod: unknown,
): Partial<T> | null {
  if (!mod || typeof mod !== "object") {
    return null;
  }

  const className = Object.keys(mod)[0];

  if (!className) {
    return null;
  }

  const ModClass = (mod as Record<string, unknown>)[className];

  if (typeof ModClass !== "function") {
    return null;
  }

  // TODO: Should this be changed? Looks weird, can just use modules instead of classes, or export a function for init
  return new (ModClass as Constructor<Partial<T>>)();
}

interface FsModule<T> {
  file: string;
  instance: T;
}

async function getDirModule<T>(
  dir: string,
  entries: Deno.DirEntry[],
  reservedName: string,
): Promise<FsModule<Partial<T>> | null> {
  const candidate = entries.find((entry) =>
    entry.isFile &&
    entry.name.replace(/(\.js|\.jsx|\.ts|\.tsx)/, "") === reservedName
  );

  if (!candidate) {
    return null;
  }

  const candidateModule = await import(`${dir}/${candidate.name}`);

  const instance = getModuleInstance<T>(candidateModule);

  if (!instance) {
    console.error("Configured improper module", candidate.name);
    return null;
  }

  return { file: candidate.name, instance };
}

function isMiddleware(value: Partial<Middleware>): value is Middleware {
  return typeof value.preRender === "function" ||
    typeof value.postRender === "function";
}

async function getMiddleware(
  dir: string,
  entries: Deno.DirEntry[],
): Promise<{ file: string; instance: Middleware } | null> {
  const res = await getDirModule<Middleware>(
    dir,
    entries,
    "_middleware",
  );
  if (!res) {
    return null;
  }

  const { file, instance } = res;

  if (!isMiddleware(instance)) {
    return null;
  }

  return { file, instance };
}

function isLayout(value: Partial<Layout>): value is Layout {
  return typeof value.render === "function";
}

async function getLayout(
  dir: string,
  entries: Deno.DirEntry[],
): Promise<FsModule<Layout> | null> {
  const res = await getDirModule<Layout>(dir, entries, "_layout");

  if (!res) {
    return null;
  }

  const { file, instance } = res;

  if (!isLayout(instance)) {
    return null;
  }

  return { file, instance };
}

function isRoute(value: Partial<Route>): value is Route {
  return typeof value.render === "function";
}

async function parseRouteDir(
  {
    dir,
    relativePath = "/",
    higherMiddlewares = [],
    higherLayouts = [],
  }: {
    dir: string;
    relativePath?: string;
    higherMiddlewares?: Middleware[];
    higherLayouts?: Layout[];
  },
): Promise<FsPath[]> {
  const dirEntries = Array.from(Deno.readDirSync(new URL(dir)));
  const middleware = await getMiddleware(dir, dirEntries);
  const layout = await getLayout(dir, dirEntries);

  if (middleware) {
    console.log(
      `${middleware.instance.constructor.name} registered on everthing under ${relativePath}`,
    );
  }

  if (layout) {
    console.log(
      `${layout.instance.constructor.name} registered on everything under ${relativePath}`,
    );
  }

  const paths: FsPath[] = [];
  const unresolvedPaths: Promise<FsPath[]>[] = [];

  const middlewares = [
    ...higherMiddlewares,
    ...(middleware ? [middleware.instance] : []),
  ];
  const layouts = [...higherLayouts, ...(layout ? [layout.instance] : [])];

  for (const entry of dirEntries) {
    if (entry.isDirectory) {
      unresolvedPaths.push(
        parseRouteDir({
          dir: `${dir}/${entry.name}`,
          relativePath: `${relativePath}${entry.name}/`,
          higherMiddlewares: middlewares,
          higherLayouts: layouts,
        }),
      );
    }

    if (middleware && middleware.file === entry.name) {
      continue;
    }

    if (layout && layout.file === entry.name) {
      continue;
    }

    const mod = await import(`${dir}/${entry.name}`);
    const route = getModuleInstance<Route>(mod);

    // TODO: Replace any special characters for params, spread, etc.
    if (route && isRoute(route)) {
      const pathname = `${relativePath}${
        entry.name.replace(/\.[^\.]+$/, "").replace("index", "")
      }`;
      console.log(`${route.constructor.name} mounted on ${pathname}`);
      paths.push({
        route,
        layouts,
        middlewares,
        pattern: new URLPattern({ pathname }),
      });
    }
  }

  return (await Promise.all(unresolvedPaths)).flat().concat(paths);
}

async function combinedLayoutRender(
  layouts: Layout[],
  route: Route,
): Promise<SaffronNode> {
  const [layout, ...rest] = layouts;

  if (!layout) {
    return route.render();
  }

  return layout.render(await combinedLayoutRender(rest, route));
}

export async function serveFileBased() {
  const rootDir = Deno.mainModule.replace(/\/[^\/]*$/, "");
  const routesDir = `${rootDir}/routes/`;

  const paths = await parseRouteDir({ dir: routesDir });

  Deno.serve(async (req) => {
    const url = new URL(req.url);

    if (req.url.match("favicon.ico")) {
      return new Response();
    }
    const query: Record<string, string> = {};
    url.searchParams.forEach((k, v) => query[k] = v);

    const matched = paths.find((path) => !!path.pattern.exec(req.url));

    // TODO: Don't match twice
    // const match = matched?.pattern.exec(req.url);

    if (matched) {
      matched.middlewares.forEach(async (m) => await m.preRender?.(req));
      const html = await combinedLayoutRender(matched.layouts, matched.route);

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
