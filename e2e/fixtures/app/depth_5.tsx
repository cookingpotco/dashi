import { type ReadArgs, RouteSlot } from "dashi";
import { recordDepthHit } from "./depth_stats.ts";

export function Depth5({ html }: ReadArgs) {
  recordDepthHit("/d5");
  return html(<RouteSlot src="/d6" />);
}
