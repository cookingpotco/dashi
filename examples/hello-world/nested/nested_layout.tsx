import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function NestedLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
