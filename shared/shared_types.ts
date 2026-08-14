import { type Element } from "../jsx-runtime/jsx_types.ts";

export interface Route {
  render(req: Request): Element | Promise<Element>;
}

// TODO: Can/should we make Middlewares support layout functionality?
// They are very similar, so it's worth having just 1 way of doing things
export interface Layout {
  render(
    req: Request,
    children: Element,
  ): Promise<Element> | Element;
}

/**
 * Runs around a matched route. `preRender` and `postRender` are awaited in
 * registration order. Neither hook can skip the route; `postRender` may mutate
 * response headers before the response is returned.
 */
export interface Middleware {
  preRender?: (
    req: Request,
  ) => void | Promise<void>;
  postRender?: (res: Response) => void | Promise<void>;
}

export interface RoutingPath {
  route: Route;
  pattern: URLPattern;
  layouts: Layout[];
  middlewares: Middleware[];
}
