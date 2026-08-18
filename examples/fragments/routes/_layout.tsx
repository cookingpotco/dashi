import { type Element, type WrapCtx } from "dashi";

export default function RootLayout(
  _ctx: WrapCtx,
  children: Element,
): Element {
  return (
    <html>
      <h1>Website Title</h1>
      {children}
    </html>
  );
}
