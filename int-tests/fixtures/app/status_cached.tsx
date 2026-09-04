import { CacheStrategy, type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

export function statusCached(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="status-cached">handler-cached-404</p>, {
    status: 404,
    cache: { strategy: CacheStrategy.Public, maxAge: 30 },
  });
}
