import type { Ctx, Html, ParamsOf } from "dashi";
import type { AppState } from "./state.ts";

export function Post(
  ctx: Ctx<ParamsOf<"/posts/:id">, AppState>,
  html: Html,
) {
  return html(<p id="post">{ctx.params.id}</p>);
}
