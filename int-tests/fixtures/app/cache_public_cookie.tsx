import { CacheStrategy, type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

export function CachePublicCookie(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="cache-public-cookie">cached-public-cookie</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  });
}
