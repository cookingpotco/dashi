import { type Ctx, type Html } from "dashi";

let count = 0;

export function list(_ctx: Ctx, html: Html) {
  count += 1;
  return html(<span id="refresh-stamp">{count}</span>);
}
