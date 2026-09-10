import { type ReadArgs, RouteSlot } from "dashi";

export function LazyBelow({ html }: ReadArgs) {
  return html(
    <div>
      <div style="height: 3000px"></div>
      <RouteSlot src="/below-counted" />
    </div>,
  );
}
