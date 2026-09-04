import { CacheStrategy, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "../state.ts";

export function CacheOverride(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="cache-override">route-wins</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 60 },
  });
}
