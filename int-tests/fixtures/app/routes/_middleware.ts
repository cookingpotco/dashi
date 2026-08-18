import type { WrapCtx } from "dashi";
import type { AppState } from "../state.ts";

export default async function root(
  ctx: WrapCtx<AppState>,
  next: () => Promise<Response>,
): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  ctx.state.pre = "from-mw";
  const res = await next();
  res.headers.set("x-mw", "ok");
  return res;
}
