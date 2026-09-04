import { type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

export function Bare(_ctx: Ctx<Record<string, never>, AppState>, html: Html) {
  return html(<p id="heading">bare</p>);
}
