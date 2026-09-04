import { type LayoutArgs, NavigationRoot } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function RootLayout({ children }: LayoutArgs): Element {
  return (
    <html>
      <head>
        <title>Hello World</title>
      </head>
      <h1>Website Title</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/nested">Nested</a>
        <a href="/guestbook">Guestbook</a>
      </nav>
      <NavigationRoot>
        {children}
      </NavigationRoot>
    </html>
  );
}
