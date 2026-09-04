import { CacheStrategy, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "../state.ts";

export function CacheCors(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="cache-cors">cors-cached</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Accept-Language"],
    },
  });
}
