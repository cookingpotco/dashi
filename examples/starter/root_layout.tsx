import { type LayoutArgs, NavigationRoot } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import styles from "./styles.json" with { type: "json" };

export function RootLayout({ children }: LayoutArgs): Element {
  return (
    <html lang="en">
      <head>
        <title>Welcome to Dashi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="/static/favicon.ico"
          type="image/x-icon"
        />
        <link
          rel="preload"
          href="/static/plus-jakarta-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link rel="stylesheet" href={styles.href} />
      </head>
      <body className="flex min-h-screen flex-col">
        <NavigationRoot className="flex grow flex-col">
          {children}
        </NavigationRoot>
      </body>
    </html>
  );
}
