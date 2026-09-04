import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function statusOk(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="status-ok">handler-200</p>);
}
