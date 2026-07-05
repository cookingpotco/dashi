import { DashiNode } from "../jsx-runtime/jsx_types.ts";

export interface Route {
  render(req: Request): DashiNode | Promise<DashiNode>;
}

// TODO: Can/should we make Middlewares support layout functionality?
// They are very similar, so it's worth having just 1 way of doing things
export interface Layout {
  render(
    req: Request,
    children: DashiNode,
  ): Promise<DashiNode> | DashiNode;
}

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
