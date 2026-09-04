import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function CacheNoStore(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(<p id="cache-nostore">cached-nostore</p>, {
    cache: { strategy: CacheStrategy.NoStore },
  });
}
