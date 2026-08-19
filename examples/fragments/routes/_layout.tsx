import { type Element, type WrapperCtx } from "dashi";

export default function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <h1>Website Title</h1>
      {children}
    </html>
  );
}
