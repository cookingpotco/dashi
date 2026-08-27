import { group, type Middleware } from "dashi";
import type { AppState } from "../state.ts";

const requireSession: Middleware<AppState> = (ctx, next) => {
  if (!ctx.req.headers.get("cookie")?.includes("session=")) {
    return Response.redirect(new URL("/", ctx.url), 303);
  }
  return next();
};

export const gated = group<AppState>(({ route }) => ({
  middleware: [requireSession],
  routes: [route("/gated", { GET: Gated })],
}));

function Gated() {
  return <p id="gated">welcome</p>;
}
