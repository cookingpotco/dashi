import { CacheStrategy, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function CachePrivate(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="cache-private">cached-private</p>, {
    cache: {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      staleWhileRevalidate: 120,
    },
  });
}
