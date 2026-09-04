import { CacheStrategy, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "../state.ts";

export function CacheSession(
  ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  if (ctx.state.token) {
    return html(<p id="cache-session">signed-in</p>);
  }
  return html(<p id="cache-session">marketing</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 60 },
  });
}
