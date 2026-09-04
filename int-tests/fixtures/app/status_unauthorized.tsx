import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function statusUnauthorized(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="status-unauthorized">handler-401</p>, { status: 401 });
}
