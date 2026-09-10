import { type ReadArgs, RouteSlot } from "dashi";
import { recordDepthHit } from "./depth_stats.ts";

export function Depth4({ html }: ReadArgs) {
  recordDepthHit("/d4");
  return html(<RouteSlot src="/d5" />);
}
