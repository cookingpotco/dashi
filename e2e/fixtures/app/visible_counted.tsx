import { type Ctx, type Html } from "dashi";

let hits = 0;

export function VisibleCounted(_ctx: Ctx, html: Html) {
  hits += 1;
  return html(<p id="visible-counted">visible-counted</p>);
}

export function visibleHitsHandler() {
  return new Response(String(hits));
}
