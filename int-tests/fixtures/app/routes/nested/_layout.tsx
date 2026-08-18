import { type Element, type WrapCtx } from "dashi";
import type { AppState } from "../../state.ts";

export default function NestedLayout(
  _ctx: WrapCtx<AppState>,
  children: Element,
): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
