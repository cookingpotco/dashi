import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
