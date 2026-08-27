import { group } from "dashi";

let hits = 0;

export const counted = group("/counted", ({ route }) => ({
  routes: [route("/", { GET: Counted })],
}));

function Counted() {
  hits += 1;
  return <p id="counted">counted</p>;
}

export function countedHitCount(): number {
  return hits;
}
