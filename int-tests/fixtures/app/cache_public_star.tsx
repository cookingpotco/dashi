import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function CachePublicStar(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(<p id="cache-public-star">cached-public-star</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["*"],
    },
  });
}
