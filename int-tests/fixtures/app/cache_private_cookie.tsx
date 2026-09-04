import { CacheStrategy, type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

export function CachePrivateCookie(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="cache-private-cookie">cached-private-cookie</p>, {
    cache: {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  });
}
