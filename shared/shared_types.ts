import { type Element } from "../jsx-runtime/jsx_types.ts";

export type Handler = (req: Request) => Element | Promise<Element>;

export type Layout = (
  req: Request,
  children: Element,
) => Element | Promise<Element>;

export type Middleware = (
  req: Request,
  next: () => Promise<Response>,
) => Response | Promise<Response>;

export interface RoutingPath {
  handler: Handler;
  pattern: URLPattern;
  layouts: Layout[];
  middlewares: Middleware[];
}
