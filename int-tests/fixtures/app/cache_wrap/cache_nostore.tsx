import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function CacheNoStore(
  { html }: ReadArgs<AppState>,
) {
  return html(<p id="cache-nostore">cached-nostore</p>, {
    cache: { strategy: CacheStrategy.NoStore },
  });
}
