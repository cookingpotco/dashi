import type { CacheConfig } from "../caching/mod.ts";
import type { Patch } from "../patching/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";

/**
 * Per-invocation request context. Mutate `state` in place; do not
 * replace the object. Layouts do not run when `isFragment` is true.
 */
export interface Ctx<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> {
  /** Incoming request. */
  readonly req: Request;
  /** Request URL. */
  readonly url: URL;
  /** Path params from the matched route. */
  readonly params: Params;
  /** True when this hit is a fragment include or lazy fetch. */
  readonly isFragment: boolean;
  /** Per-request state. Mutate fields in place; do not replace the object. */
  readonly state: Partial<State>;
}

/**
 * `Ctx` as seen by middleware or an error handler. Params are a wide
 * string record so one wrap can cover `/` and `/posts/:id`. Same object
 * as the handler's ctx at runtime; precise keys stay on the handler.
 */
export type WrapperCtx<
  State extends Record<string, unknown> = Record<string, unknown>,
> = Ctx<State, Record<string, string>>;

/**
 * `Ctx` as seen by a layout. Same object as the handler's ctx at
 * runtime; `state` is readonly. Layouts are shared UI only. They run
 * after the route has rendered. Never use them for gating or
 * state-setting — that belongs on middleware or individual route
 * handlers.
 */
export type LayoutCtx<
  State extends Record<string, unknown> = Record<string, unknown>,
> = Omit<WrapperCtx<State>, "state"> & {
  readonly state: Readonly<Partial<State>>;
};

/**
 * GET / HEAD args. A read may return a raw `Response` and never call
 * `html`. `State` is first so a handler that only needs app state
 * writes `ReadArgs<AppState>`. Omit both when the handler uses neither.
 */
export interface ReadArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> {
  /** Per-invocation request context. */
  ctx: Ctx<State, Params>;
  /** Bound HTML sealer. */
  html: SealHtml;
}

/**
 * POST / PUT / PATCH / DELETE args. A write may return a raw `Response`
 * and never call `patches`. `State` is first, same as `ReadArgs`.
 */
export interface WriteArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> {
  /** Per-invocation request context. */
  ctx: Ctx<State, Params>;
  /** Bound patch sealer. */
  patches: SealPatches;
}

/**
 * `notFound` args. Same fields as `ReadArgs`; params are a wide string
 * record so one wrap can cover `/` and `/posts/:id`.
 */
export type NotFoundArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> = ReadArgs<State, Record<string, string>>;

/** Group `error` args. `thrown` is the raw value. */
export interface ErrorArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Per-invocation request context. */
  ctx: WrapperCtx<State>;
  /** Raw thrown value. */
  thrown: unknown;
  /** Bound HTML sealer. Default status 500. */
  html: SealHtml;
}

/** Last-resort 500 args. No `ctx`, no `thrown`. */
export interface FatalArgs {
  /** Bound HTML sealer. Default status 500. No layouts. */
  html: SealHtml;
}

/** Layout args. `ctx.state` is readonly. */
export interface LayoutArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Per-invocation request context. `state` is readonly. */
  ctx: LayoutCtx<State>;
  /** Wrapped route output. */
  children: Element;
}

/** Middleware args. Mutate `ctx.state` in place. */
export interface MiddlewareArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Per-invocation request context. Mutate `state` in place. */
  ctx: WrapperCtx<State>;
  /** Next middleware or the matched handler. */
  next: () => Promise<Response>;
}

/**
 * Seal-time framework options for `html()` and `patches()`. Other
 * headers: mutate the returned `Response`. A raw `Cache-Control`
 * header is not a twin of `cache`.
 */
export interface SealOptions {
  /** Document or patch HTTP status. Omitted uses the call site default. */
  status?: number;
  /** Cache policy. Omitted is no-store, plus `Vary: x-fragment`. */
  cache?: CacheConfig;
}

/**
 * Bound HTML sealer. Walks layouts on a document hit, then seals bytes
 * once. Fragments skip layouts. Default status depends on the call
 * site (GET 200, `notFound` 404, `error` / `fatal` 500).
 */
export type SealHtml = (
  page: Element,
  opts?: SealOptions,
) => Response | Promise<Response>;

/**
 * Bound patch sealer. Never walks layouts. Default status 200.
 */
export type SealPatches = (
  list: readonly Patch[],
  opts?: SealOptions,
) => Response | Promise<Response>;

/**
 * Last-resort 500. No layouts, no `ctx`, no `thrown`. Omitted: text 500.
 *
 * @internal
 */
export type Fatal = (args: FatalArgs) => Response | Promise<Response>;

/**
 * Route function. Always returns a `Response`. Call `html()` to seal
 * document or fragment markup (layouts, DOCTYPE, fragment splice,
 * default cache headers). A raw `Response` is sent as-is: no layouts,
 * DOCTYPE, or fragment splice.
 *
 * Only the router calls a handler. A direct call skips the target's
 * middleware and error boundary and leaves it reading the caller's
 * `ctx`. Share markup as a component; include another route's rendered
 * output with `<RouteFragment src>`.
 */
/** @internal */
export type Handler<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> = (
  args: ReadArgs<State, Params>,
) => Response | Promise<Response>;

/**
 * Group error UI. `thrown` is the raw value. Call `html()` to seal
 * markup (remaining layouts from this boundary; fragments: this
 * group's `error` only). A raw `Response` is sent as-is. Default
 * status 500.
 */
/** @internal */
export type ErrorHandler<
  State extends Record<string, unknown> = Record<string, unknown>,
> = (
  args: ErrorArgs<State>,
) => Response | Promise<Response>;

/**
 * Methods the router advertises. GET also answers HEAD; every matched
 * path answers OPTIONS. HEAD and OPTIONS are not handler keys on the
 * route map.
 */
/** @internal */
export const METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
] as const;
/** @internal */
export type Method = typeof METHODS[number];

/**
 * POST/PUT/PATCH/DELETE. Call `patches()` to seal a patch list, or
 * return a raw `Response`. Patches never walk layouts.
 */
/** @internal */
export type WriteHandler<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> = (
  args: WriteArgs<State, Params>,
) => Response | Promise<Response>;

type HandlerMethod = Exclude<Method, "HEAD" | "OPTIONS">;

type MethodHandlerMap<
  State extends Record<string, unknown>,
  Params extends Record<string, string>,
> = {
  [M in HandlerMethod]?: M extends "GET" ? Handler<State, Params>
    : WriteHandler<State, Params>;
};

type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * Per-method handlers on a route. At least one method is required. GET
 * seals a page or fragment with `html()`. Writes seal patches with
 * `patches()`, or return a Response.
 *
 * @internal
 */
export type MethodHandlers<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> = RequireAtLeastOne<MethodHandlerMap<State, Params>>;

/**
 * Shared UI that wraps the route on document render, outermost first.
 * Runs after the route has rendered. Does not run on fragment renders
 * (eager `<RouteFragment>` or a lazy fetch). Never use a layout for
 * gating or state-setting — that belongs on middleware or individual
 * route handlers.
 */
/** @internal */
export type Layout<
  State extends Record<string, unknown> = Record<string, unknown>,
> = (
  args: LayoutArgs<State>,
) => Element | Promise<Element>;

/**
 * Request pipeline, outermost first. Runs for document hits and fragment
 * hits.
 */
/** @internal */
export type Middleware<
  State extends Record<string, unknown> = Record<string, unknown>,
> = (
  args: MiddlewareArgs<State>,
) => Response | Promise<Response>;

/**
 * One group's layouts, optional `error`, and optional `notFound`.
 * `parent` is the enclosing group, if any. A group's `error` catches
 * handler throws and inner group failures; it does not catch that
 * group's own layouts. `notFound` handles document misses captured
 * here; omitted walks to the parent.
 */
/** @internal */
export interface GroupBoundary<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  layouts: Layout<State>[];
  error?: ErrorHandler<State>;
  notFound?: Handler<State, Record<string, string>>;
  parent?: GroupBoundary<State>;
}
