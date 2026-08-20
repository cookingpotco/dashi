import { type Element, type WrapperCtx } from "dashi";
import type { AppState } from "./state.ts";

export function NestedLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
