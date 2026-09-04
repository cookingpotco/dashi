import { CacheStrategy, type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

export function CachePrivate(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="cache-private">cached-private</p>, {
    cache: {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      staleWhileRevalidate: 120,
    },
  });
}
