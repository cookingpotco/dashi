import { type ReadArgs, RouteSlot } from "dashi";

export function Embed({ html }: ReadArgs) {
  return html(
    <div>
      <RouteSlot src="/stamped" />
      <RouteSlot src="/lazy" />
    </div>,
  );
}
