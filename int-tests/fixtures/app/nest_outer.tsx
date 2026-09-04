import { type Ctx, type Html, RouteFragment } from "dashi";

export function NestOuter(_ctx: Ctx, html: Html) {
  return html(
    <div id="nest-outer">
      <RouteFragment src="/nest-mid" />
    </div>,
  );
}
