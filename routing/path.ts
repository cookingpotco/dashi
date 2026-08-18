import {
  Layout,
  type MethodHandlers,
  METHODS,
  Middleware,
} from "../shared/shared_types.ts";
import { type ParamsOf, type PathError } from "./path_types.ts";

export type { Method, MethodHandlers } from "../shared/shared_types.ts";
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

export interface Route<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  kind: NodeKind.Route;
  path: string;
  handlers: MethodHandlers<Record<string, string>, State>;
  layouts: Layout<State>[];
  middleware: Middleware<State>[];
}

export interface Group<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  kind: NodeKind.Group;
  layouts: Layout<State>[];
  middleware: Middleware<State>[];
  routes: Array<Route<State> | Group<State>>;
}

export interface RouteTable<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  /**
   * UI that wraps the route on document render, outermost first. Does
   * not run on fragment renders (eager `<RouteFragment>` or a lazy
   * fetch).
   */
  layouts?: Layout<State>[];
  /**
   * Request pipeline, outermost first. Runs for document hits and
   * fragment hits.
   */
  middleware?: Middleware<State>[];
  routes: Array<Route<State> | Group<State>>;
}

export interface CompiledRoute<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  segments: ConcreteSegment[];
  handlers: MethodHandlers<Record<string, string>, State>;
  layouts: Layout<State>[];
  middleware: Middleware<State>[];
  declarationIndex: number;
  path: string;
}

export interface MatchedRoute<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  handlers: MethodHandlers<Record<string, string>, State>;
  params: Record<string, string>;
  layouts: Layout<State>[];
  middleware: Middleware<State>[];
}

export interface CompiledTable<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  staticByPath: Map<string, CompiledRoute<State>>;
  dynamic: CompiledRoute<State>[];
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

function compareCompiled(
  a: { segments: ConcreteSegment[]; declarationIndex: number },
  b: { segments: ConcreteSegment[]; declarationIndex: number },
): number {
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

export function compile<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(routes: Route<State>[]): CompiledTable<State> {
  const compiled: CompiledRoute<State>[] = [];
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
        handlers: declared.handlers,
        layouts: declared.layouts,
        middleware: declared.middleware,
        declarationIndex: i,
        path: declared.path,
      });
    }
  }

  const staticByPath = new Map<string, CompiledRoute<State>>();
  const dynamic: CompiledRoute<State>[] = [];
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

function matched<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  compiledRoute: CompiledRoute<State>,
  params: Record<string, string>,
): MatchedRoute<State> {
  return {
    handlers: compiledRoute.handlers,
    params,
    layouts: compiledRoute.layouts,
    middleware: compiledRoute.middleware,
  };
}

export function match<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  compiled: CompiledTable<State>,
  pathname: string,
): MatchedRoute<State> | null {
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

/**
 * Declares a path with per-method handlers. Two `route()` calls for the
 * same path are a compile error; GET and POST share one row.
 */
export function route<
  Path extends string,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  path: [PathError<Path>] extends [never] ? Path : PathError<Path>,
  handlers: MethodHandlers<ParamsOf<Path>, State>,
): Route<State> {
  if (!METHODS.some((method) => handlers[method])) {
    throw new Error(
      `Route ${JSON.stringify(path)} has no method handlers`,
    );
  }
  return {
    kind: NodeKind.Route,
    path,
    // Path literals prove narrower params than Route stores; match only
    // fills the declared keys, so this widening is safe.
    handlers: handlers as Route<State>["handlers"],
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
export function group<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(opts: RouteTable<State>): Group<State> {
  return {
    kind: NodeKind.Group,
    layouts: opts.layouts ?? [],
    middleware: opts.middleware ?? [],
    routes: opts.routes,
  };
}

export function flatten<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(table: RouteTable<State>): Route<State>[] {
  const routes: Route<State>[] = [];
  append(
    table.routes,
    table.layouts ?? [],
    table.middleware ?? [],
    routes,
  );
  return routes;
}

function append<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  nodes: Array<Route<State> | Group<State>>,
  layouts: Layout<State>[],
  middleware: Middleware<State>[],
  routes: Route<State>[],
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
      handlers: node.handlers,
      layouts: [...layouts, ...node.layouts],
      middleware: [...middleware, ...node.middleware],
    });
  }
}
