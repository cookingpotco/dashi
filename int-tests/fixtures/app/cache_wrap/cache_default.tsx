import type { Ctx, SealHtml } from "dashi";
import type { AppState } from "../state.ts";

export function CacheDefault(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="cache-default">from-handler</p>);
}
