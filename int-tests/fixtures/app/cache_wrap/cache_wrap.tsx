import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function CacheWrap(
  _ctx: WrapperCtx<AppState>,
  children: Element,
) {
  return <div id="cache-wrap">{children}</div>;
}
