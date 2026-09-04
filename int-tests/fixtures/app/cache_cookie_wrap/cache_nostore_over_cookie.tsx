import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function CacheNoStoreOverCookie(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(
    <p id="cache-nostore-over-cookie">cached-nostore-over-cookie</p>,
    {
      cache: { strategy: CacheStrategy.NoStore },
    },
  );
}
