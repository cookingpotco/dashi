import { type ReadArgs, RouteSlot } from "dashi";

export function DepthEmbed({ html }: ReadArgs) {
  return html(<RouteSlot src="/d1" />);
}
