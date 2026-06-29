import { DashiNode } from "../jsx-runtime/jsx_types.ts";
import { Layout, Route } from "../shared/shared_types.ts";

export async function renderRoute(
  layouts: Layout[],
  route: Route,
): Promise<DashiNode> {
  const [layout, ...rest] = layouts;

  if (!layout) {
    return route.render();
  }

  return layout.render(await renderRoute(rest, route));
}
