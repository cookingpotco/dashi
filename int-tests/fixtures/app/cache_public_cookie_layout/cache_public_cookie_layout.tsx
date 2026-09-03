import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function CachePublicCookieLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
) {
  return <div id="cache-public-cookie-layout">{children}</div>;
}
