import { type Ctx, type Html, RouteFragment } from "dashi";

export function NestMid(_ctx: Ctx, html: Html) {
  return html(
    <div id="nest-mid">
      <RouteFragment src="/nest-inner" />
    </div>,
  );
}
