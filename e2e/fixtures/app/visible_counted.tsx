import { type ReadArgs } from "dashi";

let hits = 0;

export function VisibleCounted({ html }: ReadArgs) {
  hits += 1;
  return html(<p id="visible-counted">visible-counted</p>);
}

export function visibleHitsHandler() {
  return new Response(String(hits));
}
