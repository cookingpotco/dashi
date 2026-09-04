import { type Ctx, group, type SealHtml, type WrapperCtx } from "dashi";
import type { AppState } from "../state.ts";

function requireSession(
  ctx: WrapperCtx<AppState>,
  next: () => Promise<Response>,
) {
  if (!ctx.req.headers.get("cookie")?.includes("session=")) {
    return Response.redirect(new URL("/", ctx.url), 303);
  }
  return next();
}

export const gated = group<AppState>(({ route }) => ({
  middleware: [requireSession],
  routes: [route("/gated", { GET: Gated })],
}));

function Gated(_ctx: Ctx<Record<string, never>, AppState>, html: SealHtml) {
  return html(<p id="gated">welcome</p>);
}
