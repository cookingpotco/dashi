import { type Ctx, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function Bare(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="heading">bare</p>);
}
