import { type Element } from "../jsx-runtime/jsx_types.ts";

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
 * DOCTYPE, or fragment splice.
 */
export type Handler<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: Ctx<Params, State>,
) => Element | Response | Promise<Element | Response>;

/**
 * Group error UI. `thrown` is the raw value. A returned `Response` is
 * sent as-is; `Element` is wrapped in remaining parent layouts (skipped
 * on fragment hits).
 */
export type ErrorHandler<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: WrapperCtx<State>,
  thrown: unknown,
) => Element | Response | Promise<Element | Response>;

/**
 * Methods the router advertises. GET also answers HEAD; HEAD is not a
 * handler key on the route map.
 */
export const METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;
export type Method = typeof METHODS[number];

export type MethodHandlers<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = {
  [M in Exclude<Method, "HEAD">]?: Handler<Params, State>;
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
) => Element | Promise<Element>;

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
