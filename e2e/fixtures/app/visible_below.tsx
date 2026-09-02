import { RouteFragment } from "dashi";

export function VisibleBelow() {
  return (
    <div>
      <div style="height: 3000px"></div>
      <RouteFragment
        src="/visible-counted"
        lazy="visible"
        fallback={<span id="visible-fallback">Loading visible...</span>}
      />
    </div>
  );
}
