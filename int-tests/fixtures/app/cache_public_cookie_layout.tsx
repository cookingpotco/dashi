import { cached, CacheStrategy, type Element, type WrapperCtx } from "dashi";
import type { AppState } from "./state.ts";

export function CachePublicCookieLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
) {
  return cached(
    <div id="cache-public-cookie-layout">{children}</div>,
    {
      strategy: CacheStrategy.Public,
      maxAge: 30,
      varyHeaders: ["Cookie"],
    },
  );
}
