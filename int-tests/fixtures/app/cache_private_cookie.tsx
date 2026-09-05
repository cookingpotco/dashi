import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function CachePrivateCookie(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(<p id="cache-private-cookie">cached-private-cookie</p>, {
    cache: {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  });
}
