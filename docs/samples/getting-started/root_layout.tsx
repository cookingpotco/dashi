import type { WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import styles from "./styles.json" with { type: "json" };

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <head>
        <title>Hello</title>
        <link rel="stylesheet" href={styles.href} />
      </head>
      <body>{children}</body>
    </html>
  );
}
