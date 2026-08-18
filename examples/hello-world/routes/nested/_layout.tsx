import { type Element, type WrapperCtx } from "dashi";

export default function NestedLayout(
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
