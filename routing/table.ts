import {
  type ErrorHandler,
  type Fatal,
  type GroupBoundary,
  type Handler,
  type Layout,
  type MethodHandlers,
  METHODS,
  type Middleware,
} from "../shared/mod.ts";
import type {
  GroupPrefixError,
  Join,
  ParamsOf,
  PathError,
} from "./path_types.ts";

export type { ErrorHandler, Method, MethodHandlers } from "../shared/mod.ts";
export type { ParamsOf } from "./path_types.ts";

/** @internal */
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

/** @internal */
export interface Route<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  kind: NodeKind.Route;
  path: string;
  handlers: MethodHandlers<Record<string, string>, State>;
}

interface FlattenedRoute<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  path: string;
  handlers: MethodHandlers<Record<string, string>, State>;
  boundary?: GroupBoundary<State>;
  middleware: Middleware<State>[];
}

/**
 * One node in the route tree. `prefix` is this group's own path prefix
 * (`null` if omitted). Nested groups and routes join ancestor prefixes
 * at compile.
 */
export interface Group<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  /** Marks this as a group. */
  kind: NodeKind.Group;
  /** This group's path prefix, or `null` if pathless. */
  prefix: string | null;
  /** Document layouts, outermost first. */
  layouts: Layout<State>[];
  /** Request pipeline, outermost first. */
  middleware: Middleware<State>[];
  /** Catches handler throws and inner group failures. */
  error?: ErrorHandler<State>;
  /** Document miss handler under this group's prefix. */
  notFound?: Handler<Record<string, string>, State>;
  /** Child routes and nested groups. */
  routes: Array<Route<State> | Group<State>>;
}

/** @internal */
export interface GroupFields<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  /**
   * Shared UI that wraps the route on document render, outermost first.
   * Runs after the route has rendered. Does not run on fragment
   * renders. Never use a layout for gating or state-setting — that
   * belongs on middleware or individual route handlers.
   */
  layouts?: Layout<State>[];
  /**
   * Request pipeline, outermost first. Runs for document hits and
   * fragment hits.
   */
  middleware?: Middleware<State>[];
  /**
   * Catches handler throws and inner group failures. Does not catch
   * this group's own layouts.
   */
  error?: ErrorHandler<State>;
  /**
   * Document miss handler under this group's prefix. Call `html()` to
   * seal a 404 document with this group's layout chain; a raw
   * `Response` is sent as-is. Omitted: walk to the parent. Root
   * remains the default.
   */
  notFound?: Handler<Record<string, string>, State>;
  routes: Array<Route<State> | Group<State>>;
}

type ValidChildPath<Prefix extends string, Path extends string> = string extends
  Prefix ? [PathError<Path>] extends [never] ? Path : PathError<Path>
  : [PathError<Path>] extends [never]
    ? [PathError<Join<Prefix, Path>>] extends [never] ? Path
    : PathError<Join<Prefix, Path>>
  : PathError<Path>;

type ChildParams<Prefix extends string, Path extends string> = string extends
  Prefix ? ParamsOf<Path> : ParamsOf<Join<Prefix, Path>>;

/** @internal */
type PrefixArg<Prefix extends string> = string extends Prefix ? Prefix
  : [GroupPrefixError<Prefix>] extends [never] ? Prefix
  : GroupPrefixError<Prefix>;

/**
 * `route` closed over the group's prefix.
 */
/** @internal */
export interface GroupCallback<
  Prefix extends string = "",
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  /**
   * Declares a path with per-method handlers. Two `route()` calls for
   * the same joined path are a compile error; GET and POST share one
   * row. GET also answers HEAD. Every matched path answers OPTIONS.
   */
  route<Path extends string>(
    path: ValidChildPath<Prefix, Path>,
    handlers: MethodHandlers<ChildParams<Prefix, Path>, State>,
  ): Route<State>;
}

/** @internal */
export interface CompiledRoute<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  segments: ConcreteSegment[];
  handlers: MethodHandlers<Record<string, string>, State>;
  boundary?: GroupBoundary<State>;
  middleware: Middleware<State>[];
  declarationIndex: number;
  path: string;
}

/** @internal */
export interface MatchedRoute<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  handlers: MethodHandlers<Record<string, string>, State>;
  params: Record<string, string>;
  middleware: Middleware<State>[];
  boundary?: GroupBoundary<State>;
}

/** @internal */
export interface CompiledTable<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  staticByPath: Map<string, CompiledRoute<State>>;
  dynamic: CompiledRoute<State>[];
  rootBoundary: GroupBoundary<State>;
  rootMiddleware: Middleware<State>[];
  prefixCaptures: PrefixCapture<State>[];
  fatal?: Fatal;
  fragmentDepthLimit: number;
}

interface PrefixCapture<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  segments: ConcreteSegment[];
  boundary: GroupBoundary<State>;
  middleware: Middleware<State>[];
}

/**
 * Group that owns a document miss: the deepest prefixed group whose
 * prefix matches, or the root when none do.
 */
/** @internal */
export interface MissMatch<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  boundary: GroupBoundary<State>;
  middleware: Middleware<State>[];
  params: Record<string, string>;
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

export const DEFAULT_FRAGMENT_DEPTH_LIMIT = 5;

export function compile<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  table: Group<State>,
  fatal?: Fatal,
  fragmentDepthLimit = DEFAULT_FRAGMENT_DEPTH_LIMIT,
): CompiledTable<State> {
  const rootBoundary: GroupBoundary<State> = {
    layouts: table.layouts,
    error: table.error,
    notFound: table.notFound,
  };
  const routes: FlattenedRoute<State>[] = [];
  const prefixCaptures: PrefixCapture<State>[] = [];
  if (table.prefix !== null && table.prefix !== "/") {
    prefixCaptures.push({
      segments: concretePrefix(table.prefix),
      boundary: rootBoundary,
      middleware: table.middleware,
    });
  }
  append(
    table.routes,
    rootBoundary,
    table.middleware,
    table.prefix,
    routes,
    prefixCaptures,
  );

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
        boundary: declared.boundary,
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
  return {
    staticByPath,
    dynamic,
    rootBoundary,
    rootMiddleware: table.middleware,
    prefixCaptures,
    fatal,
    fragmentDepthLimit,
  };
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
    middleware: compiledRoute.middleware,
    boundary: compiledRoute.boundary,
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

function matchPrefix(
  segments: ConcreteSegment[],
  parts: string[],
): Record<string, string> | null {
  if (parts.length < segments.length) {
    return null;
  }
  const params: Record<string, string> = {};
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

export function matchMiss<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  compiled: CompiledTable<State>,
  pathname: string,
): MissMatch<State> {
  const parts = pathname === "/" ? [] : pathname.slice(1).split("/");
  let best: PrefixCapture<State> | undefined;
  let bestParams: Record<string, string> = {};
  for (const capture of compiled.prefixCaptures) {
    const params = matchPrefix(capture.segments, parts);
    if (
      params &&
      (!best || capture.segments.length >= best.segments.length)
    ) {
      best = capture;
      bestParams = params;
    }
  }
  if (!best) {
    return {
      boundary: compiled.rootBoundary,
      middleware: compiled.rootMiddleware,
      params: {},
    };
  }
  return {
    boundary: best.boundary,
    middleware: best.middleware,
    params: bestParams,
  };
}

/**
 * Join a group prefix and a child path. `null` and `"/"` add no
 * segments; a child of `"/"` is the prefix itself, or `"/"` when the
 * prefix is pathless.
 */
function joinPath(prefix: string | null, child: string): string;
function joinPath(
  prefix: string | null,
  child: string | null,
): string | null;
function joinPath(
  prefix: string | null,
  child: string | null,
): string | null {
  if (child === null) {
    return prefix === "/" ? null : prefix;
  }
  if (child === "/") {
    return prefix === null || prefix === "/" ? "/" : prefix;
  }
  if (!child.startsWith("/")) {
    throw new Error(`Path must start with "/": ${JSON.stringify(child)}`);
  }
  if (prefix === null || prefix === "/") {
    return child;
  }
  return `${prefix}${child}`;
}

function concretePrefix(path: string): ConcreteSegment[] {
  const segments = parsePath(path);
  const last = segments[segments.length - 1];
  if (
    last?.kind === SegmentKind.Optional ||
    last?.kind === SegmentKind.Catchall
  ) {
    throw new Error(
      `Group prefix cannot end in optional or catch-all: ${
        JSON.stringify(path)
      }`,
    );
  }
  return expand(segments)[0]!;
}

function declareRoute<
  State extends Record<string, unknown>,
>(
  prefix: string | null,
  path: string,
  handlers: MethodHandlers<Record<string, string>, State>,
): Route<State> {
  if (
    !METHODS.some((method) =>
      method !== "HEAD" && method !== "OPTIONS" && handlers[method]
    )
  ) {
    throw new Error(
      `Route ${JSON.stringify(joinPath(prefix, path))} has no method handlers`,
    );
  }
  return {
    kind: NodeKind.Route,
    path,
    handlers,
  };
}

function createGroupCallback<
  Prefix extends string,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(prefix: string | null): GroupCallback<Prefix, State> {
  return {
    route: (path, handlers) =>
      declareRoute(
        prefix,
        path,
        // Path literals prove narrower params than Route stores; match
        // only fills the declared keys, so this widening is safe.
        handlers as Route<State>["handlers"],
      ),
  };
}

/**
 * Declares a node in the route tree. Pass a prefix to join onto child
 * paths, or omit it for a pathless layout/middleware shell. `"/"` is
 * not a valid prefix. The callback's `route` closes over this group's
 * prefix so handlers see joined params. Nested groups are `group()`
 * values in `routes`. `notFound` handles document misses under this
 * prefix; omitted walks to the parent.
 *
 * Layouts are shared UI only. They wrap the route on document render,
 * outermost first, after the route has rendered, and do not run on
 * fragment renders. Never use them for gating or state-setting — that
 * belongs on middleware or individual route handlers. Middleware is
 * the request pipeline, outermost first, and runs for document hits
 * and fragment hits. `error` catches handler throws and inner group
 * failures; it does not catch this group's own layouts.
 *
 * @param prefix Path joined onto child routes. Omit for a pathless shell.
 * @param build Callback that receives `route` closed over `prefix`.
 *
 * @example
 * ```ts
 * export const menu = group("/menu", ({ route }) => ({
 *   layouts: [MenuLayout],
 *   routes: [
 *     route("/", { GET: ({ html }) => html(<h1>Menu</h1>) }),
 *     route("/specials", { GET: ({ html }) => html(<p>Today</p>) }),
 *   ],
 * }));
 * ```
 */
export function group<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
  const Prefix extends string = string,
>(
  prefix: PrefixArg<Prefix>,
  build: (cb: GroupCallback<Prefix, State>) => GroupFields<State>,
): Group<State>;
/** Pathless group: a layout/middleware shell with no extra prefix. */
export function group<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  build: (cb: GroupCallback<"", State>) => GroupFields<State>,
): Group<State>;
export function group<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  prefixOrBuild:
    | string
    | ((cb: GroupCallback<string, State>) => GroupFields<State>),
  maybeBuild?: (cb: GroupCallback<string, State>) => GroupFields<State>,
): Group<State> {
  if (typeof prefixOrBuild === "function") {
    const fields = prefixOrBuild(createGroupCallback<"", State>(null));
    return {
      kind: NodeKind.Group,
      prefix: null,
      layouts: fields.layouts ?? [],
      middleware: fields.middleware ?? [],
      error: fields.error,
      notFound: fields.notFound,
      routes: fields.routes,
    };
  }
  const fields = maybeBuild!(
    createGroupCallback<string, State>(prefixOrBuild),
  );
  return {
    kind: NodeKind.Group,
    prefix: prefixOrBuild,
    layouts: fields.layouts ?? [],
    middleware: fields.middleware ?? [],
    error: fields.error,
    notFound: fields.notFound,
    routes: fields.routes,
  };
}

function append<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  nodes: Array<Route<State> | Group<State>>,
  parent: GroupBoundary<State>,
  middleware: Middleware<State>[],
  ancestorPrefix: string | null,
  routes: FlattenedRoute<State>[],
  prefixCaptures: PrefixCapture<State>[],
): void {
  for (const node of nodes) {
    if (node.kind === NodeKind.Group) {
      const joined = joinPath(ancestorPrefix, node.prefix);
      const boundary: GroupBoundary<State> = {
        layouts: node.layouts,
        error: node.error,
        notFound: node.notFound,
        parent,
      };
      const stacked = [...middleware, ...node.middleware];
      if (node.prefix !== null && node.prefix !== "/") {
        prefixCaptures.push({
          segments: concretePrefix(joinPath(ancestorPrefix, node.prefix)),
          boundary,
          middleware: stacked,
        });
      }
      append(
        node.routes,
        boundary,
        stacked,
        joined,
        routes,
        prefixCaptures,
      );
      continue;
    }
    routes.push({
      path: joinPath(ancestorPrefix, node.path),
      handlers: node.handlers,
      boundary: parent,
      middleware,
    });
  }
}
