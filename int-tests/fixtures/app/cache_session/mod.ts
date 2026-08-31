import { group, type WrapperCtx } from "dashi";
import type { AppState } from "../state.ts";
import { CacheSession } from "./cache_session.tsx";

function takeToken(ctx: WrapperCtx<AppState>, next: () => Promise<Response>) {
  if (ctx.req.headers.get("cookie")?.includes("token=")) {
    ctx.state.token = "1";
  }
  return next();
}

export const cacheSession = group<AppState>(({ route }) => ({
  middleware: [takeToken],
  routes: [route("/cache-session", { GET: CacheSession })],
}));
