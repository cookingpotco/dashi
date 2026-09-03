import type { WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <head>
        <title>Client JS</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
