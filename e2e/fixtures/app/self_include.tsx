import { type ReadArgs, RouteSlot } from "dashi";
import { recordCycleHit } from "./cycle_stats.ts";

export function SelfInclude({ html }: ReadArgs) {
  recordCycleHit("/self-include");
  return html(<RouteSlot src="/self-include" />);
}
