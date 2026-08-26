import { type Element, type WrapperCtx } from "dashi";

export function BareLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
