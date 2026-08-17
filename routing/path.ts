import { type Element } from "../jsx-runtime/jsx_types.ts";
import { Handler, Layout, Middleware } from "../shared/shared_types.ts";
import { type ParamsOf, type PathError } from "./path_types.ts";

export type { ParamsOf } from "./path_types.ts";

const enum NodeKind {
  Route = "route",
  Group = "group",
}

const enum SegmentKind {
  Static = "static",
  Param = "param",
  Optional = "optional",
  Catchall = "catchall",
}

type ParamKind =
  | SegmentKind.Param
  | SegmentKind.Optional
  | SegmentKind.Catchall;

type ParsedSegment =
  | { kind: SegmentKind.Static; value: string }
  | { kind: SegmentKind.Param; name: string }
  | { kind: SegmentKind.Optional; name: string }
  | { kind: SegmentKind.Catchall; name: string };

type ConcreteSegment =
  | { kind: SegmentKind.Static; value: string }
  | { kind: SegmentKind.Param; name: string }
  | { kind: SegmentKind.Catchall; name: string };

export interface Route {
  kind: NodeKind.Route;
  path: string;
  handler: (
    req: Request,
    params: Record<string, string>,
  ) => Element | Promise<Element>;
  layouts: Layout[];
  middleware: Middleware[];
}

export interface Group {
  kind: NodeKind.Group;
  layouts: Layout[];
  middleware: Middleware[];
  routes: Array<Route | Group>;
}

export interface RouteTable {
  /**
   * UI that wraps the route on document render, outermost first. Does
   * not run on fragment renders (eager `<RouteFragment>` or a lazy
   * fetch).
   */
  layouts?: Layout[];
  /**
   * Request pipeline, outermost first. Runs for document hits and
   * fragment hits.
   */
  middleware?: Middleware[];
  routes: Array<Route | Group>;
}

export interface CompiledRoute {
  segments: ConcreteSegment[];
  handler: Route["handler"];
  layouts: Layout[];
  middleware: Middleware[];
  declarationIndex: number;
  path: string;
}

export interface MatchedRoute {
  handler: Route["handler"];
  params: Record<string, string>;
  layouts: Layout[];
  middleware: Middleware[];
}

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function parsePath(path: string): ParsedSegment[] {
  if (path === "/") {
    return [];
  }
  if (!path.startsWith("/")) {
    throw new Error(`Path must start with "/": ${JSON.stringify(path)}`);
  }
  if (path.endsWith("/")) {
    throw new Error(
      `No trailing slash except "/": ${JSON.stringify(path)}`,
    );
  }

  const parts = path.slice(1).split("/");
  const segments: ParsedSegment[] = [];
  const names = new Set<string>();

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const last = i === parts.length - 1;

    if (part === "") {
      throw new Error(
        `Empty segments are not allowed: ${JSON.stringify(path)}`,
      );
    }
    if (part === "*") {
      throw new Error(
        `Catch-all must be named (":path*", not "*"): ${JSON.stringify(path)}`,
      );
    }
    if (part.startsWith(":")) {
      let kind: ParamKind = SegmentKind.Param;
      let name = part.slice(1);
      if (name.endsWith("?")) {
        kind = SegmentKind.Optional;
        name = name.slice(0, -1);
      } else if (name.endsWith("*")) {
        kind = SegmentKind.Catchall;
        name = name.slice(0, -1);
      }
      if (
        (kind === SegmentKind.Optional || kind === SegmentKind.Catchall) &&
        !last
      ) {
        throw new Error(
          `Optional and catch-all are only allowed as the last segment: ${
            JSON.stringify(path)
          }`,
        );
      }
      if (!NAME_RE.test(name)) {
        throw new Error(
          `Invalid param name ${JSON.stringify(part)} in ${
            JSON.stringify(path)
          }`,
        );
      }
      if (names.has(name)) {
        throw new Error(
          `Duplicate param name ${JSON.stringify(name)} in ${
            JSON.stringify(path)
          }`,
        );
      }
      names.add(name);
      segments.push({ kind, name });
      continue;
    }

    segments.push({ kind: SegmentKind.Static, value: part });
  }

  return segments;
}

function expand(segments: ParsedSegment[]): ConcreteSegment[][] {
  const last = segments[segments.length - 1];
  if (last?.kind === SegmentKind.Optional) {
    const withoutOptional: ConcreteSegment[] = [];
    for (const segment of segments.slice(0, -1)) {
      if (segment.kind !== SegmentKind.Optional) {
        withoutOptional.push(segment);
      }
    }
    return [
      withoutOptional,
      [...withoutOptional, { kind: SegmentKind.Param, name: last.name }],
    ];
  }

  const concrete: ConcreteSegment[] = [];
  for (const segment of segments) {
    if (segment.kind !== SegmentKind.Optional) {
      concrete.push(segment);
    }
  }
  return [concrete];
}

function shapeKey(segments: ConcreteSegment[]): string {
  return segments.map((segment) =>
    segment.kind === SegmentKind.Static ? `s:${segment.value}` : segment.kind
  ).join("/");
}

function rank(kind: ConcreteSegment["kind"]): number {
  if (kind === SegmentKind.Static) {
    return 0;
  }
  if (kind === SegmentKind.Param) {
    return 1;
  }
  return 2;
}

function compareCompiled(a: CompiledRoute, b: CompiledRoute): number {
  const n = Math.max(a.segments.length, b.segments.length);
  for (let i = 0; i < n; i++) {
    const sa = a.segments[i];
    const sb = b.segments[i];
    if (!sa) {
      return -1;
    }
    if (!sb) {
      return 1;
    }
    const d = rank(sa.kind) - rank(sb.kind);
    if (d !== 0) {
      return d;
    }
  }
  return a.declarationIndex - b.declarationIndex;
}

export interface CompiledTable {
  staticByPath: Map<string, CompiledRoute>;
  dynamic: CompiledRoute[];
}

function staticPathname(segments: ConcreteSegment[]): string | null {
  let pathname = "";
  for (const segment of segments) {
    if (segment.kind !== SegmentKind.Static) {
      return null;
    }
    pathname += `/${segment.value}`;
  }
  return pathname === "" ? "/" : pathname;
}

export function compile(routes: Route[]): CompiledTable {
  const compiled: CompiledRoute[] = [];
  const seen = new Map<string, string>();

  for (let i = 0; i < routes.length; i++) {
    const declared = routes[i]!;
    for (const segments of expand(parsePath(declared.path))) {
      const key = shapeKey(segments);
      const existing = seen.get(key);
      if (existing !== undefined) {
        throw new Error(
          `Duplicate or unreachable route: ${JSON.stringify(existing)} and ${
            JSON.stringify(declared.path)
          }`,
        );
      }
      seen.set(key, declared.path);
      compiled.push({
        segments,
        handler: declared.handler,
        layouts: declared.layouts,
        middleware: declared.middleware,
        declarationIndex: i,
        path: declared.path,
      });
    }
  }

  const staticByPath = new Map<string, CompiledRoute>();
  const dynamic: CompiledRoute[] = [];
  for (const compiledRoute of compiled) {
    const pathname = staticPathname(compiledRoute.segments);
    if (pathname !== null) {
      staticByPath.set(pathname, compiledRoute);
    } else {
      dynamic.push(compiledRoute);
    }
  }
  dynamic.sort(compareCompiled);
  return { staticByPath, dynamic };
}

function matchPattern(
  segments: ConcreteSegment[],
  parts: string[],
): Record<string, string> | null {
  const last = segments[segments.length - 1];
  const params: Record<string, string> = {};

  if (last?.kind === SegmentKind.Catchall) {
    if (parts.length < segments.length - 1) {
      return null;
    }
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]!;
      const part = parts[i]!;
      if (seg.kind === SegmentKind.Static) {
        if (part !== seg.value) {
          return null;
        }
      } else {
        params[seg.name] = part;
      }
    }
    params[last.name] = parts.slice(segments.length - 1).join("/");
    return params;
  }

  if (parts.length !== segments.length) {
    return null;
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const part = parts[i]!;
    if (seg.kind === SegmentKind.Static) {
      if (part !== seg.value) {
        return null;
      }
    } else {
      params[seg.name] = part;
    }
  }
  return params;
}

function matched(
  compiledRoute: CompiledRoute,
  params: Record<string, string>,
): MatchedRoute {
  return {
    handler: compiledRoute.handler,
    params,
    layouts: compiledRoute.layouts,
    middleware: compiledRoute.middleware,
  };
}

export function match(
  compiled: CompiledTable,
  pathname: string,
): MatchedRoute | null {
  const exact = compiled.staticByPath.get(pathname);
  if (exact) {
    return matched(exact, {});
  }

  const parts = pathname === "/" ? [] : pathname.slice(1).split("/");
  for (const compiledRoute of compiled.dynamic) {
    const params = matchPattern(compiledRoute.segments, parts);
    if (params) {
      return matched(compiledRoute, params);
    }
  }
  return null;
}

export function route<Path extends string>(
  path: [PathError<Path>] extends [never] ? Path : PathError<Path>,
  handler: Handler<ParamsOf<Path>>,
): Route {
  return {
    kind: NodeKind.Route,
    path,
    handler: handler as Route["handler"],
    layouts: [],
    middleware: [],
  };
}

/**
 * Groups routes that share layouts and middleware. Parent lists run first.
 * Does not prefix paths.
 *
 * Layouts are UI that wraps the route on document render, outermost
 * first, and do not run on fragment renders (eager `<RouteFragment>` or
 * a lazy fetch). Middleware is the request pipeline, outermost first,
 * and runs for document hits and fragment hits.
 */
export function group(opts: RouteTable): Group {
  return {
    kind: NodeKind.Group,
    layouts: opts.layouts ?? [],
    middleware: opts.middleware ?? [],
    routes: opts.routes,
  };
}

export function flatten(table: RouteTable): Route[] {
  const routes: Route[] = [];
  append(
    table.routes,
    table.layouts ?? [],
    table.middleware ?? [],
    routes,
  );
  return routes;
}

function append(
  nodes: Array<Route | Group>,
  layouts: Layout[],
  middleware: Middleware[],
  routes: Route[],
): void {
  for (const node of nodes) {
    if (node.kind === NodeKind.Group) {
      append(
        node.routes,
        [...layouts, ...node.layouts],
        [...middleware, ...node.middleware],
        routes,
      );
      continue;
    }
    routes.push({
      kind: NodeKind.Route,
      path: node.path,
      handler: node.handler,
      layouts: [...layouts, ...node.layouts],
      middleware: [...middleware, ...node.middleware],
    });
  }
}
