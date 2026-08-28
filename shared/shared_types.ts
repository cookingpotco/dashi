import type { CachedElement } from "../caching/mod.ts";
import type { FragmentAction } from "../fragments/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";

/**
 * Per-invocation request context. `state` is a `Partial` bag: mutate
 * fields in place, do not replace the object. `isFragment` is the mode
 * bit; layouts never run when it is true.
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
  /** Mutable per-request bag. Do not replace the object. */
  readonly state: Partial<State>;
}

/**
 * `Ctx` as seen by a layout, middleware, or error handler. Params are a
 * wide string record so one wrap can cover `/` and `/posts/:id`. Same
 * object as the handler's ctx at runtime; precise keys stay on the
 * handler.
 */
export type WrapperCtx<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = Ctx<Record<string, string>, State>;

/**
 * Route function. A returned `Response` is sent as-is: no layouts,
 * DOCTYPE, or fragment splice. `cached()` attaches a cache policy to an
 * Element return.
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
  | Response
  | Promise<Element | CachedElement | Response>;

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
 * POST/PUT/PATCH/DELETE. Return fragment actions (no layouts, no
 * DOCTYPE) or a Response. A 2xx `text/html` Response is rejected.
 */
/** @internal */
export type WriteHandler<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: Ctx<Params, State>,
) =>
  | Response
  | FragmentAction[]
  | Promise<Response | FragmentAction[]>;

/**
 * Per-method handlers on a route. GET returns a page or fragment body.
 * Writes return a list of fragment actions, or a Response.
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
 * UI that wraps the route on document render, outermost first. Does not
 * run on fragment renders (eager `<RouteFragment>` or a lazy fetch).
 */
/** @internal */
export type Layout<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: WrapperCtx<State>,
  children: Element,
) => Element | CachedElement | Promise<Element | CachedElement>;

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
