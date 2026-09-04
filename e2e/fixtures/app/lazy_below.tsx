import { type ReadArgs, RouteFragment } from "dashi";

export function LazyBelow({ html }: ReadArgs) {
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
