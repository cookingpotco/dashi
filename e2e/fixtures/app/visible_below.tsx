import { type ReadArgs, RouteSlot } from "dashi";

export function VisibleBelow({ html }: ReadArgs) {
  return html(
    <div>
      <div style="height: 3000px"></div>
      <RouteSlot
        src="/visible-counted"
        fetchWhen="visible"
        fallback={<span id="visible-fallback">Loading visible...</span>}
      />
    </div>,
  );
}
