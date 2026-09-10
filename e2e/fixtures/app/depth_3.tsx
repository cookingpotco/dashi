import { type ReadArgs, RouteSlot } from "dashi";
import { recordDepthHit } from "./depth_stats.ts";

export function Depth3({ html }: ReadArgs) {
  recordDepthHit("/d3");
  return html(<RouteSlot src="/d4" />);
}
