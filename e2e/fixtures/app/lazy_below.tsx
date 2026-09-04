import { type Ctx, RouteFragment, type SealHtml } from "dashi";

export function LazyBelow(_ctx: Ctx, html: SealHtml) {
  return html(
    <div>
      <div style="height: 3000px"></div>
      <RouteFragment
        src="/below-counted"
        lazy
        fallback={<span id="below-fallback">Loading below...</span>}
      />
    </div>,
  );
}
