import { depthHitCounts, resetDepthHits } from "./depth_stats.ts";

export function depthHitsHandler() {
  return Response.json(depthHitCounts());
}

export function resetDepthHitsHandler() {
  resetDepthHits();
  return new Response(null, { status: 204 });
}
