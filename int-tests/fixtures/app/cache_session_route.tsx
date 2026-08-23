import { cached, CacheStrategy, type Ctx } from "dashi";
import type { AppState } from "./state.ts";

export function CacheSession(ctx: Ctx<Record<string, never>, AppState>) {
  if (ctx.state.token) {
    return <p id="cache-session">signed-in</p>;
  }
  return cached(
    <p id="cache-session">marketing</p>,
    { strategy: CacheStrategy.Public, maxAge: 60 },
  );
}
