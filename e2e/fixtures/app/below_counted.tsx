import { type Ctx, type SealHtml } from "dashi";

let hits = 0;

export function BelowCounted(_ctx: Ctx, html: SealHtml) {
  hits += 1;
  return html(<p id="below-counted">below-counted</p>);
}

export function belowHitsHandler() {
  return new Response(String(hits));
}
