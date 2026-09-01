import { RouteFragment } from "dashi";

export function LazyBelow() {
  return (
    <div>
      <div style="height: 3000px"></div>
      <RouteFragment
        src="/below-counted"
        lazy
        fallback={<span id="below-fallback">Loading below...</span>}
      />
    </div>
  );
}
