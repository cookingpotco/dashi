import { type Ctx, type SealHtml } from "dashi";

export function list(_ctx: Ctx, html: SealHtml) {
  return html(<span id="slot-inside">inside</span>);
}
