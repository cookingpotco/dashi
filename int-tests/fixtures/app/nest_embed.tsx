import { type Ctx, type Html, RouteFragment } from "dashi";

export function NestEmbed(_ctx: Ctx, html: Html) {
  return html(<RouteFragment src="/nest-outer" />);
}
