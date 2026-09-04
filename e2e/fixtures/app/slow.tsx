import { type Ctx, type Html } from "dashi";

export async function Slow(_ctx: Ctx, html: Html) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return html(<p id="slow-body">slow-body</p>);
}
