import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function statusNotFound(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="status-not-found">handler-404</p>, { status: 404 });
}
