import type { Ctx, ParamsOf } from "dashi";
import type { AppState } from "../state.ts";

export default function Post(
  ctx: Ctx<ParamsOf<"/posts/:id">, AppState>,
) {
  return <p id="post">{ctx.params.id}</p>;
}
