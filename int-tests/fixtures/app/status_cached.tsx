import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function statusCached(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(<p id="status-cached">handler-cached-404</p>, {
    status: 404,
    cache: { strategy: CacheStrategy.Public, maxAge: 30 },
  });
}
