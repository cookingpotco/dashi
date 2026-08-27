import { group } from "dashi";
import { countedHitCount } from "../counted/mod.tsx";

export const countedHits = group("/counted-hits", ({ route }) => ({
  routes: [route("/", { GET: countedHitsHandler })],
}));

function countedHitsHandler() {
  return new Response(String(countedHitCount()));
}
