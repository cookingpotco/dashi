import { type LayoutArgs, NavigationRoot } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function RootLayout({ children }: LayoutArgs): Element {
  return (
    <html>
      <header>
        <p id="persistent">persistent</p>
        <form id="header-search" method="GET" action="/search">
          <input id="header-search-q" name="q" />
          <button id="header-search-submit" type="submit">Search</button>
        </form>
        <form id="header-write" method="POST" action="/frag">
          <input id="header-write-title" name="title" />
          <button id="header-write-submit" type="submit">Add</button>
        </form>
      </header>
      <NavigationRoot>
        {children}
      </NavigationRoot>
    </html>
  );
}
