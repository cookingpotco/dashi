import type { Ctx, Html } from "dashi";
import type { AppState } from "../state.ts";

export function CacheFromLayout(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="cache-from-layout">from-handler</p>);
}
