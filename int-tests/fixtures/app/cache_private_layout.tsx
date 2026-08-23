import { cached, CacheStrategy, type Element, type WrapperCtx } from "dashi";
import type { AppState } from "./state.ts";

export function CachePrivateLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
) {
  return cached(
    <div id="cache-private-layout">{children}</div>,
    { strategy: CacheStrategy.Private },
  );
}
