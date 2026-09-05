import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function CachePrivate(
  { html }: ReadArgs<AppState>,
) {
  return html(<p id="cache-private">cached-private</p>, {
    cache: {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      staleWhileRevalidate: 120,
    },
  });
}
