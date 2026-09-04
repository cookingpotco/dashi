import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function CachePublic(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(<p id="cache-public">cached-public</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      staleWhileRevalidate: 3600,
      staleIfError: 120,
      varyHeaders: ["Accept-Language"],
    },
  });
}
