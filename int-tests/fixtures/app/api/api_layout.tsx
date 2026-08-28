import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function ApiLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
): Element {
  return <div id="api-wrap">{children}</div>;
}
