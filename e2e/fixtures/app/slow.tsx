import { type Ctx, type SealHtml } from "dashi";

export async function Slow(_ctx: Ctx, html: SealHtml) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return html(<p id="slow-body">slow-body</p>);
}
