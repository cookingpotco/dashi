import { type Element } from "../jsx-runtime/jsx_types.ts";

export type Handler<P = Record<string, never>> = (
  req: Request,
  params: P,
) => Element | Promise<Element>;

/**
 * Page chrome, outermost first. Does not run on fragment renders
 * (eager `<RouteFragment>` or a lazy fetch).
 */
export type Layout = (
  req: Request,
  children: Element,
) => Element | Promise<Element>;

/**
 * Request pipeline, outermost first. Runs for document hits and fragment
 * hits.
 */
export type Middleware = (
  req: Request,
  next: () => Promise<Response>,
) => Response | Promise<Response>;
