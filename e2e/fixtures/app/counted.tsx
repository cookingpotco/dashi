import { type ReadArgs } from "dashi";

let hits = 0;

export function Counted({ html }: ReadArgs) {
  hits += 1;
  return html(<p id="counted">counted</p>);
}

export function countedHitCount(): number {
  return hits;
}
