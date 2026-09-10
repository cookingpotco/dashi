import { type ReadArgs, RouteSlot } from "dashi";
import { recordDepthHit } from "./depth_stats.ts";

export function Depth1({ html }: ReadArgs) {
  recordDepthHit("/d1");
  return html(<RouteSlot src="/d2" />);
}
