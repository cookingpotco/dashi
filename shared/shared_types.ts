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

export type Handler<
  Params extends Record<string, string> = Record<string, never>,
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (ctx: Ctx<Params, State>) => Element | Promise<Element>;

/**
 * UI that wraps the route on document render, outermost first. Does not
 * run on fragment renders (eager `<RouteFragment>` or a lazy fetch).
 */
export type Layout<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: Ctx<Record<string, string>, State>,
  children: Element,
) => Element | Promise<Element>;

/**
 * Request pipeline, outermost first. Runs for document hits and fragment
 * hits.
 */
export type Middleware<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> = (
  ctx: Ctx<Record<string, string>, State>,
  next: () => Promise<Response>,
) => Response | Promise<Response>;
