import { type Ctx, RouteFragment, type SealHtml } from "dashi";

export function Empty(_ctx: Ctx, html: SealHtml) {
  return html(
    <RouteFragment
      src="/empty-fail"
      lazy
      fallback={<span id="empty-fallback">Loading empty...</span>}
    />,
  );
}
