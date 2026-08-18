import { type Element, type LayoutCtx } from "dashi";
import type { AppState } from "../../state.ts";

export default function NestedLayout(
  _ctx: LayoutCtx<AppState>,
  children: Element,
): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
