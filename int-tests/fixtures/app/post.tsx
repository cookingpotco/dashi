import type { ParamsOf, ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function Post(
  { ctx, html }: ReadArgs<AppState, ParamsOf<"/posts/:id">>,
) {
  return html(<p id="post">{ctx.params.id}</p>);
}
