import { cycleHitCounts, resetCycleHits } from "./cycle_stats.ts";

export function cycleHitsHandler() {
  return Response.json(cycleHitCounts());
}

export function resetCycleHitsHandler() {
  resetCycleHits();
  return new Response(null, { status: 204 });
}
