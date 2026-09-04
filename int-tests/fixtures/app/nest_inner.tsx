import type { Ctx, Html } from "dashi";

export function NestInner(_ctx: Ctx, html: Html) {
  return html(<p id="nested-frag">nested-fragment-body</p>);
}
