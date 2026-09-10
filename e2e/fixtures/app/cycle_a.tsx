import { type ReadArgs, RouteSlot } from "dashi";
import { recordCycleHit } from "./cycle_stats.ts";

export function CycleA({ html }: ReadArgs) {
  recordCycleHit("/cycle-a");
  return html(<RouteSlot src="/cycle-b" />);
}
