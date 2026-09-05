import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function CacheOverride(
  { html }: ReadArgs<AppState>,
) {
  return html(<p id="cache-override">route-wins</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 60 },
  });
}
