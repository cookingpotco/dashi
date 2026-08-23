import { type CachedElement } from "../caching/mod.ts";
import { type Element } from "../jsx-runtime/mod.ts";

/**
 * Per-invocation request context. `state` is a `Partial` bag: mutate
 * fields in place, do not replace the object. `isFragment` is the mode
 * bit; layouts never run when it is true.
 */
export interface Ctx<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  readonly req: Request;
  readonly url: URL;
  readonly params: Params;
  readonly isFragment: boolean;
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
 */
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
export const METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
] as const;
export type Method = typeof METHODS[number];

export type MethodHandlers<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = {
  [M in Exclude<Method, "HEAD" | "OPTIONS">]?: Handler<Params, State>;
};

/**
 * UI that wraps the route on document render, outermost first. Does not
 * run on fragment renders (eager `<RouteFragment>` or a lazy fetch).
 */
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
export type Middleware<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: WrapperCtx<State>,
  next: () => Promise<Response>,
) => Response | Promise<Response>;
