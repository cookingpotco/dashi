import { NavigationRoot, type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import { Go } from "./go.tsx";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <head>
        <title>Navigation</title>
      </head>
      <body>
        <header>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <Go href="/about">Go about</Go>
        </header>
        <NavigationRoot>
          {children}
        </NavigationRoot>
      </body>
    </html>
  );
}
