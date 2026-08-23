import { cached, CacheStrategy, type Element, type WrapperCtx } from "dashi";
import type { AppState } from "./state.ts";

export function CachePublicLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
) {
  return cached(
    <div id="cache-public-layout">{children}</div>,
    { strategy: CacheStrategy.Public, maxAge: 30 },
  );
}
