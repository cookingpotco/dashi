import { group, type Middleware } from "dashi";
import type { AppState } from "../state.ts";
import { CacheSession } from "../cache_session_route.tsx";

const takeToken: Middleware<AppState> = (ctx, next) => {
  if (ctx.req.headers.get("cookie")?.includes("token=")) {
    ctx.state.token = "1";
  }
  return next();
};

export const cacheSession = group<AppState>(({ route }) => ({
  middleware: [takeToken],
  routes: [route("/cache-session", { GET: CacheSession })],
}));
