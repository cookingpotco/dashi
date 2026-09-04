import { type Ctx, type Html } from "dashi";

let hits = 0;

export function Counted(_ctx: Ctx, html: Html) {
  hits += 1;
  return html(<p id="counted">counted</p>);
}

export function countedHitCount(): number {
  return hits;
}
