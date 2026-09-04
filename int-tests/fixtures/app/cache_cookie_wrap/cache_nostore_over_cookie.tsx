import { CacheStrategy, type Ctx, type Html } from "dashi";
import type { AppState } from "../state.ts";

export function CacheNoStoreOverCookie(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <p id="cache-nostore-over-cookie">cached-nostore-over-cookie</p>,
    {
      cache: { strategy: CacheStrategy.NoStore },
    },
  );
}
