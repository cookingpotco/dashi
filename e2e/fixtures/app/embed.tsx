import { type ReadArgs, RouteSlot } from "dashi";

export function Embed({ html }: ReadArgs) {
  return html(
    <div>
      <RouteSlot src="/eager" />
      <RouteSlot src="/lazy" />
    </div>,
  );
}
