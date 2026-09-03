import type { CachedElement } from "../caching/mod.ts";
import type { Patch } from "../patching/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";
import type { StatusElement } from "../status/mod.ts";

/**
 * Per-invocation request context. Mutate `state` in place; do not
 * replace the object. Layouts do not run when `isFragment` is true.
 */
export interface Ctx<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
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
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = Ctx<Record<string, string>, State>;

/**
 * `Ctx` as seen by a layout. Same object as the handler's ctx at
 * runtime; `state` is readonly. Layouts are shared UI only. They run
 * after the route has rendered. Never use them for gating or
 * state-setting — that belongs on middleware or individual route
 * handlers.
 */
/** @internal */
export type LayoutCtx<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = Omit<WrapperCtx<State>, "state"> & {
  readonly state: Readonly<Partial<State>>;
};

/**
 * Route function. A returned `Response` is sent as-is: no layouts,
 * DOCTYPE, or fragment splice. `cached()` attaches a cache policy to an
 * Element return. `status()` sets the document HTTP status on the JSX
 * path; layouts still wrap.
 *
 * Only the router calls a handler. A direct call skips the target's
 * middleware and error boundary and leaves it reading the caller's
 * `ctx`. Share markup as a component; include another route's rendered
 * output with `<RouteFragment src>`.
 */
/** @internal */
export type Handler<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: Ctx<Params, State>,
) =>
  | Element
  | CachedElement
  | StatusElement
  | Response
  | Promise<Element | CachedElement | StatusElement | Response>;

/**
 * Group error UI. `thrown` is the raw value. A returned `Response` is
 * sent as-is; `Element` is wrapped in remaining parent layouts (skipped
 * on fragment hits). `cached()` attaches a cache policy.
 */
/** @internal */
export type ErrorHandler<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: WrapperCtx<State>,
  thrown: unknown,
) =>
  | Element
  | CachedElement
  | Response
  | Promise<Element | CachedElement | Response>;

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
 * POST/PUT/PATCH/DELETE. Return patches (no layouts, no DOCTYPE) or
 * a Response. A 2xx `text/html` Response is rejected.
 */
/** @internal */
export type WriteHandler<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: Ctx<Params, State>,
) =>
  | Response
  | Patch[]
  | Promise<Response | Patch[]>;

/**
 * Per-method handlers on a route. GET returns a page or fragment body.
 * Writes return a list of patches, or a Response.
 */
/** @internal */
export type MethodHandlers<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = {
  [M in Exclude<Method, "HEAD" | "OPTIONS">]?: M extends "GET"
    ? Handler<Params, State>
    : WriteHandler<Params, State>;
};

/**
 * Shared UI that wraps the route on document render, outermost first.
 * Runs after the route has rendered. Does not run on fragment renders
 * (eager `<RouteFragment>` or a lazy fetch). Never use a layout for
 * gating or state-setting — that belongs on middleware or individual
 * route handlers.
 */
/** @internal */
export type Layout<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: LayoutCtx<State>,
  children: Element,
) => Element | Promise<Element>;

/**
 * Request pipeline, outermost first. Runs for document hits and fragment
 * hits.
 */
/** @internal */
export type Middleware<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: WrapperCtx<State>,
  next: () => Promise<Response>,
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
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  layouts: Layout<State>[];
  error?: ErrorHandler<State>;
  notFound?: Handler<Record<string, string>, State>;
  parent?: GroupBoundary<State>;
}
