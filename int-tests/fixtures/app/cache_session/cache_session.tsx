import { CacheStrategy, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function CacheSession(
  { ctx, html }: ReadArgs<{ state: AppState }>,
) {
  if (ctx.state.token) {
    return html(<p id="cache-session">signed-in</p>);
  }
  return html(<p id="cache-session">marketing</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 60 },
  });
}
