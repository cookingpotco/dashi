import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function CacheOverrideWrap(
  _ctx: WrapperCtx<AppState>,
  children: Element,
) {
  return <div id="cache-override-wrap">{children}</div>;
}
