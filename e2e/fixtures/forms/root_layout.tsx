import { type Element, NavigationRoot, type WrapperCtx } from "dashi";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
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
