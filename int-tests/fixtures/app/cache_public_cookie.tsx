import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function CachePublicCookie(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(<p id="cache-public-cookie">cached-public-cookie</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  });
}
