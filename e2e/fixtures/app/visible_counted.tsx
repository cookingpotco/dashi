import { type Ctx, type SealHtml } from "dashi";

let hits = 0;

export function VisibleCounted(_ctx: Ctx, html: SealHtml) {
  hits += 1;
  return html(<p id="visible-counted">visible-counted</p>);
}

export function visibleHitsHandler() {
  return new Response(String(hits));
}
