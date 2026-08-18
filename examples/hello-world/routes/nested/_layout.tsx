import { type Element, type LayoutCtx } from "dashi";

export default function NestedLayout(
  _ctx: LayoutCtx,
  children: Element,
): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
