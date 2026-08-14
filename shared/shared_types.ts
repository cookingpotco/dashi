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
 * Hooks around a matched route. They return nothing and cannot replace the
 * response or skip later hooks.
 *
 * `postRender` may mutate headers on the existing `Response`. `status` and
 * `body` are not replaceable through this API. Do not read the body (it is the
 * stream `Deno.serve` will send).
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
