import { CacheStrategy, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function CachePublicStar(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="cache-public-star">cached-public-star</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["*"],
    },
  });
}
