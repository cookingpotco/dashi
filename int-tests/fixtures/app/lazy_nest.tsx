import { type Ctx, type Html, RouteFragment } from "dashi";

export function LazyNest(_ctx: Ctx, html: Html) {
  return html(<RouteFragment src="/nest-inner" />);
}
