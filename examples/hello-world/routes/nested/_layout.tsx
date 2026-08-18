import { type Element, type WrapCtx } from "dashi";

export default function NestedLayout(
  _ctx: WrapCtx,
  children: Element,
): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
