import { error, info } from "../logging/mod.ts";
import {
  Handler,
  Layout,
  Middleware,
  RoutingPath,
} from "../shared/shared_types.ts";

function defaultExport<T>(mod: unknown): T | null {
  if (!mod || typeof mod !== "object") {
    return null;
  }

  const value = (mod as { default?: unknown }).default;
  if (typeof value !== "function") {
    return null;
  }

  return value as T;
}

async function loadReserved<T>(
  dir: string,
  entries: Deno.DirEntry[],
  reservedName: string,
): Promise<{ file: string; fn: T } | null> {
  const candidate = entries.find((entry) =>
    entry.isFile &&
    entry.name.replace(/(\.jsx|\.js|\.tsx|\.ts)/, "") === reservedName
  );

  if (!candidate) {
    return null;
  }

  const fn = defaultExport<T>(await import(`${dir}/${candidate.name}`));
  if (!fn) {
    error("Configured improper module", candidate.name);
    return null;
  }

  return { file: candidate.name, fn };
}

// COO-12 deletes this walk. Filename is the path; default export is the function.
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
  const middleware = await loadReserved<Middleware>(
    dir,
    dirEntries,
    "_middleware",
  );
  const layout = await loadReserved<Layout>(dir, dirEntries, "_layout");

  if (middleware) {
    info(`[MIDDLEWARE] ${middleware.file} registered ${relativePath}`);
  }

  if (layout) {
    info(`[LAYOUT]     ${layout.file} registered on ${relativePath}`);
  }

  const paths: RoutingPath[] = [];
  const unresolvedPaths: Promise<RoutingPath[]>[] = [];

  const middlewares = [
    ...higherMiddlewares,
    ...(middleware ? [middleware.fn] : []),
  ];
  const layouts = [...higherLayouts, ...(layout ? [layout.fn] : [])];

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

    const handler = defaultExport<Handler>(
      await import(`${dir}/${entry.name}`),
    );

    // TODO: Replace any special characters for params, spread, etc.
    if (handler) {
      const pathname = `${relativePath}${
        entry.name.replace(/\.[^\.]+$/, "").replace("index", "")
      }`;
      info(`[ROUTE]      mounted on ${pathname}`);
      paths.push({
        handler,
        layouts,
        middlewares,
        pattern: new URLPattern({ pathname }),
      });
    }
  }

  return (await Promise.all(unresolvedPaths)).flat().concat(paths);
}
