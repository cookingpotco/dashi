import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function statusForbidden(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="status-forbidden">handler-403</p>, { status: 403 });
}
