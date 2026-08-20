import { type Element, type WrapperCtx } from "dashi";

export function RootLayout(
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
