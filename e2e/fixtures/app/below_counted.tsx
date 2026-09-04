import { type ReadArgs } from "dashi";

let hits = 0;

export function BelowCounted({ html }: ReadArgs) {
  hits += 1;
  return html(<p id="below-counted">below-counted</p>);
}

export function belowHitsHandler() {
  return new Response(String(hits));
}
