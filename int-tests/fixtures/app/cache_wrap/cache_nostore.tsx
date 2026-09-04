import { CacheStrategy, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "../state.ts";

export function CacheNoStore(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="cache-nostore">cached-nostore</p>, {
    cache: { strategy: CacheStrategy.NoStore },
  });
}
