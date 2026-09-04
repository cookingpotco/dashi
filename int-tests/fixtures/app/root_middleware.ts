import type { MiddlewareArgs } from "dashi";
import type { AppState } from "./state.ts";

export async function root(
  { ctx, next }: MiddlewareArgs<AppState>,
): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  ctx.state.pre = "from-mw";
  const res = await next();
  res.headers.set("x-mw", "ok");
  return res;
}
