import { type ReadArgs, RouteSlot } from "dashi";
import { recordCycleHit } from "./cycle_stats.ts";

export function CycleB({ html }: ReadArgs) {
  recordCycleHit("/cycle-b");
  return html(<RouteSlot src="/cycle-a" />);
}
