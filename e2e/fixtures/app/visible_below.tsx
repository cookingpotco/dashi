import { type Ctx, RouteFragment, type SealHtml } from "dashi";

export function VisibleBelow(_ctx: Ctx, html: SealHtml) {
  return html(
    <div>
      <div style="height: 3000px"></div>
      <RouteFragment
        src="/visible-counted"
        lazy="visible"
        fallback={<span id="visible-fallback">Loading visible...</span>}
      />
    </div>,
  );
}
