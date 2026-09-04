import { CacheStrategy, type Ctx, type Html } from "dashi";
import type { AppState } from "../state.ts";

export function CacheNoStore(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="cache-nostore">cached-nostore</p>, {
    cache: { strategy: CacheStrategy.NoStore },
  });
}
