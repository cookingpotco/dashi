import { type Ctx, type Html, RouteFragment } from "dashi";

export function CacheEmbed(_ctx: Ctx, html: Html) {
  return html(
    <div id="cache-embed">
      <RouteFragment src="/cache-public" />
    </div>,
  );
}
