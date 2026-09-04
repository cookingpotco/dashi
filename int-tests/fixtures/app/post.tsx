import type { Ctx, ParamsOf, SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function Post(
  ctx: Ctx<ParamsOf<"/posts/:id">, AppState>,
  html: SealHtml,
) {
  return html(<p id="post">{ctx.params.id}</p>);
}
