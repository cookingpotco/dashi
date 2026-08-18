import type { Middleware } from "dashi";
import type { AppState } from "../state.ts";

const root: Middleware<AppState> = async (ctx, next) => {
  await new Promise((resolve) => setTimeout(resolve, 25));
  ctx.state.pre = "from-mw";
  const res = await next();
  res.headers.set("x-mw", "ok");
  return res;
};

export default root;
