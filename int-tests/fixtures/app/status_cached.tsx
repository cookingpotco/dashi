import { CacheStrategy, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function statusCached(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<p id="status-cached">handler-cached-404</p>, {
    status: 404,
    cache: { strategy: CacheStrategy.Public, maxAge: 30 },
  });
}
