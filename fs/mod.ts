import { error, info } from "../logging/mod.ts";
import {
  Layout,
  Middleware,
  Route,
  RoutingPath,
} from "../shared/shared_types.ts";

interface FsModule<T> {
  file: string;
  instance: T;
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

async function getDirModule<T>(
  dir: string,
  entries: Deno.DirEntry[],
  reservedName: string,
): Promise<FsModule<Partial<T>> | null> {
  const candidate = entries.find((entry) =>
    entry.isFile &&
    entry.name.replace(/(\.jsx|\.js|\.tsx|\.ts)/, "") === reservedName
  );

  if (!candidate) {
    return null;
  }

  const candidateModule = await import(`${dir}/${candidate.name}`);

  const instance = getModuleInstance<T>(candidateModule);

  if (!instance) {
    error("Configured improper module", candidate.name);
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

export async function parseRoutesDir(
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
): Promise<RoutingPath[]> {
  info(`Parsing ${relativePath}`);
  const dirEntries = Array.from(Deno.readDirSync(new URL(dir)));
  const middleware = await getMiddleware(dir, dirEntries);
  const layout = await getLayout(dir, dirEntries);

  if (middleware) {
    info(
      `[MIDDLEWARE] ${middleware.instance.constructor.name} registered ${relativePath}`,
    );
  }

  if (layout) {
    info(
      `[LAYOUT]     ${layout.instance.constructor.name} registered on ${relativePath}`,
    );
  }

  const paths: RoutingPath[] = [];
  const unresolvedPaths: Promise<RoutingPath[]>[] = [];

  const middlewares = [
    ...higherMiddlewares,
    ...(middleware ? [middleware.instance] : []),
  ];
  const layouts = [...higherLayouts, ...(layout ? [layout.instance] : [])];

  for (const entry of dirEntries) {
    if (entry.isDirectory) {
      unresolvedPaths.push(
        parseRoutesDir({
          dir: `${dir}${entry.name}/`,
          relativePath: `${relativePath}${entry.name}/`,
          higherMiddlewares: middlewares,
          higherLayouts: layouts,
        }),
      );
      continue;
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
      info(
        `[ROUTE]      ${route.constructor.name} mounted on ${pathname}`,
      );
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
