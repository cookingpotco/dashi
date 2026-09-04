import type { Ctx, SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function statusNotFound(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="status-not-found">handler-404</p>, { status: 404 });
}
