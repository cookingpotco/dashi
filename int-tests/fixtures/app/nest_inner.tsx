import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function NestInner(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="nested-frag">nested-fragment-body</p>);
}
