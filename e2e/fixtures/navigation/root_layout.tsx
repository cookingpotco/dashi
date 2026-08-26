import { type Element, NavigationRoot, type WrapperCtx } from "dashi";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <header id="persistent">persistent</header>
      <NavigationRoot>
        {children}
      </NavigationRoot>
    </html>
  );
}
