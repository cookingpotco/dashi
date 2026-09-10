import { type ReadArgs, RouteSlot } from "dashi";
import { recordDepthHit } from "./depth_stats.ts";

export function Depth2({ html }: ReadArgs) {
  recordDepthHit("/d2");
  return html(<RouteSlot src="/d3" />);
}
