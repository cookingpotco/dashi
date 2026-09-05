import { group, type MiddlewareArgs, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

function requireSession({ ctx, next }: MiddlewareArgs<AppState>) {
  if (!ctx.req.headers.get("cookie")?.includes("session=")) {
    return Response.redirect(new URL("/", ctx.url), 303);
  }
  return next();
}

export const gated = group<AppState>(({ route }) => ({
  middleware: [requireSession],
  routes: [route("/gated", { GET: Gated })],
}));

function Gated({ html }: ReadArgs<{ state: AppState }>) {
  return html(<p id="gated">welcome</p>);
}
