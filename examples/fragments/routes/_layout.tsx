import { type Element, type LayoutCtx } from "dashi";

export default function RootLayout(
  _ctx: LayoutCtx,
  children: Element,
): Element {
  return (
    <html>
      <h1>Website Title</h1>
      {children}
    </html>
  );
}
