import { countedHitCount } from "./counted_route.tsx";

export function countedHits() {
  return new Response(String(countedHitCount()));
}
