import { type Element } from "../jsx-runtime/jsx_types.ts";
import { Handler, Layout, Middleware } from "../shared/shared_types.ts";

type Alpha =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "_";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Alnum = Alpha | Digit;

type RestAlnum<N extends string> = N extends "" ? true
  : N extends `${infer F}${infer R}` ? F extends Alnum ? RestAlnum<R> : false
  : false;

type ValidName<N extends string> = N extends `${infer F}${infer R}`
  ? F extends Alpha ? RestAlnum<R> : false
  : false;

type Split<S extends string> = S extends `${infer A}/${infer B}`
  ? [A, ...Split<B>]
  : [S];

type SegsOf<P extends string> = P extends "/" ? []
  : P extends `/${infer Rest}` ? Split<Rest>
  : [];

type NameCheck<N extends string, Seen extends string[]> = ValidName<N> extends
  true ? N extends Seen[number] ? "Invalid route path: duplicate param name"
  : never
  : "Invalid route path: invalid param name";

type MidErr<H extends string, Seen extends string[]> = H extends ""
  ? "Invalid route path: empty segments are not allowed"
  : H extends "*" ? "Invalid route path: catch-all must be named (:path*)"
  : H extends `:${string}?`
    ? "Invalid route path: optional and catch-all only allowed as the last segment"
  : H extends `:${string}*`
    ? "Invalid route path: optional and catch-all only allowed as the last segment"
  : H extends `:${infer N}` ? NameCheck<N, Seen>
  : never;

type LastErr<H extends string, Seen extends string[]> = H extends ""
  ? "Invalid route path: empty segments are not allowed"
  : H extends "*" ? "Invalid route path: catch-all must be named (:path*)"
  : H extends `:${infer N}?` ? NameCheck<N, Seen>
  : H extends `:${infer N}*` ? NameCheck<N, Seen>
  : H extends `:${infer N}` ? NameCheck<N, Seen>
  : never;

type NameOf<H extends string> = H extends `:${infer N}?` ? N
  : H extends `:${infer N}*` ? N
  : H extends `:${infer N}` ? N
  : never;

type Walk<Segs extends string[], Seen extends string[] = []> = Segs extends
  [infer H extends string, ...infer T extends string[]]
  ? T extends [] ? LastErr<H, Seen>
  : MidErr<H, Seen> extends infer E
    ? [E] extends [never]
      ? Walk<T, NameOf<H> extends infer N extends string ? [...Seen, N] : Seen>
    : E
  : never
  : never;

type PathError<P extends string> = P extends "/" ? never
  : P extends `/${infer Rest}`
    ? Rest extends `${string}/`
      ? "Invalid route path: no trailing slash except /"
    : Walk<Split<Rest>>
  : "Invalid route path: path must start with /";

type SegParam<H extends string> = H extends `:${infer N}?`
  ? { [K in N]?: string }
  : H extends `:${infer N}*` ? { [K in N]: string }
  : H extends `:${infer N}` ? { [K in N]: string }
  : never;

type ParamUnion<Segs extends string[]> = Segs extends
  [infer H extends string, ...infer T extends string[]]
  ? SegParam<H> | ParamUnion<T>
  : never;

type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void ? I
  : never;

type Flatten<T> = { [K in keyof T]: T[K] };

/** Params inferred from a path literal like `/posts/:id`. */
export type ParamsOf<P extends string> = [PathError<P>] extends [never]
  ? [ParamUnion<SegsOf<P>>] extends [never] ? Record<string, never>
  : Flatten<UnionToIntersection<ParamUnion<SegsOf<P>>>>
  : never;

export interface Route {
  path: string;
  handler: (
    req: Request,
    params: Record<string, string>,
  ) => Element | Promise<Element>;
  layouts: Layout[];
  middleware: Middleware[];
}

type ConcreteSegment =
  | { kind: "static"; value: string }
  | { kind: "param"; name: string }
  | { kind: "catchall"; name: string };

interface ParsedSegment {
  kind: "static" | "param" | "optional" | "catchall";
  value?: string;
  name?: string;
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
      let kind: "param" | "optional" | "catchall" = "param";
      let name = part.slice(1);
      if (name.endsWith("?")) {
        kind = "optional";
        name = name.slice(0, -1);
      } else if (name.endsWith("*")) {
        kind = "catchall";
        name = name.slice(0, -1);
      }
      if ((kind === "optional" || kind === "catchall") && !last) {
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

    segments.push({ kind: "static", value: part });
  }

  return segments;
}

function toConcrete(segment: ParsedSegment): ConcreteSegment {
  if (segment.kind === "static") {
    return { kind: "static", value: segment.value! };
  }
  if (segment.kind === "param" || segment.kind === "catchall") {
    return { kind: segment.kind, name: segment.name! };
  }
  return { kind: "param", name: segment.name! };
}

function expand(segments: ParsedSegment[]): ConcreteSegment[][] {
  const last = segments[segments.length - 1];
  if (last?.kind === "optional") {
    const head = segments.slice(0, -1).map(toConcrete);
    return [head, [...head, { kind: "param", name: last.name! }]];
  }
  return [segments.map(toConcrete)];
}

function shapeKey(segments: ConcreteSegment[]): string {
  return segments.map((segment) =>
    segment.kind === "static" ? `s:${segment.value}` : segment.kind
  ).join("/");
}

function rank(kind: ConcreteSegment["kind"]): number {
  if (kind === "static") {
    return 0;
  }
  if (kind === "param") {
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

export function compile(routes: Route[]): CompiledRoute[] {
  const compiled: CompiledRoute[] = [];
  const seen = new Map<string, string>();

  for (let i = 0; i < routes.length; i++) {
    const r = routes[i]!;
    for (const segments of expand(parsePath(r.path))) {
      const key = shapeKey(segments);
      const existing = seen.get(key);
      if (existing !== undefined) {
        throw new Error(
          `Duplicate or unreachable route: ${JSON.stringify(existing)} and ${
            JSON.stringify(r.path)
          }`,
        );
      }
      seen.set(key, r.path);
      compiled.push({
        segments,
        handler: r.handler,
        layouts: r.layouts,
        middleware: r.middleware,
        declarationIndex: i,
        path: r.path,
      });
    }
  }

  compiled.sort(compareCompiled);
  return compiled;
}

function matchPattern(
  segments: ConcreteSegment[],
  parts: string[],
): Record<string, string> | null {
  const last = segments[segments.length - 1];
  const params: Record<string, string> = {};

  if (last?.kind === "catchall") {
    if (parts.length < segments.length - 1) {
      return null;
    }
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]!;
      const part = parts[i]!;
      if (seg.kind === "static") {
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
    if (seg.kind === "static") {
      if (part !== seg.value) {
        return null;
      }
    } else {
      params[seg.name] = part;
    }
  }
  return params;
}

export function match(
  compiled: CompiledRoute[],
  pathname: string,
): MatchedRoute | null {
  const parts = pathname === "/" ? [] : pathname.slice(1).split("/");

  for (const route of compiled) {
    const params = matchPattern(route.segments, parts);
    if (params) {
      return {
        handler: route.handler,
        params,
        layouts: route.layouts,
        middleware: route.middleware,
      };
    }
  }
  return null;
}

export function route<P extends string>(
  path: [PathError<P>] extends [never] ? P : PathError<P>,
  handler: Handler<ParamsOf<P>>,
  wraps?: { layouts?: Layout[]; middleware?: Middleware[] },
): Route {
  return {
    path,
    handler: handler as Route["handler"],
    layouts: wraps?.layouts ?? [],
    middleware: wraps?.middleware ?? [],
  };
}
