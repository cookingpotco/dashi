import type { Ctx, SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function statusOk(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="status-ok">handler-200</p>);
}
