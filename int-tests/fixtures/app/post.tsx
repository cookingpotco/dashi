import type { ParamsOf, ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function Post(
  { ctx, html }: ReadArgs<ParamsOf<"/posts/:id">, AppState>,
) {
  return html(<p id="post">{ctx.params.id}</p>);
}
