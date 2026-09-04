import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function RootLayout({ children }: LayoutArgs): Element {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
