import { countedHitCount } from "./counted.tsx";

export function countedHitsHandler() {
  return new Response(String(countedHitCount()));
}
