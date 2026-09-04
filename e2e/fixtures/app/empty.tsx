import { type Ctx, type Html, RouteFragment } from "dashi";

export function Empty(_ctx: Ctx, html: Html) {
  return html(
    <RouteFragment
      src="/empty-fail"
      lazy
      fallback={<span id="empty-fallback">Loading empty...</span>}
    />,
  );
}
