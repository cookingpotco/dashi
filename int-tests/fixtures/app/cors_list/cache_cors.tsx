import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function CacheCors({ html }: ReadArgs<Record<string, never>, AppState>) {
  return html(<p id="cache-cors">cors-cached</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Accept-Language"],
    },
  });
}
