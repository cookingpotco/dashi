import { type Ctx, type Html } from "dashi";

let hits = 0;

export function BelowCounted(_ctx: Ctx, html: Html) {
  hits += 1;
  return html(<p id="below-counted">below-counted</p>);
}

export function belowHitsHandler() {
  return new Response(String(hits));
}
