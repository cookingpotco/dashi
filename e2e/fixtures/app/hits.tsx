import { type Ctx, type SealHtml } from "dashi";

let count = 0;

export function list(_ctx: Ctx, html: SealHtml) {
  count += 1;
  return html(<span id="refresh-stamp">{count}</span>);
}
