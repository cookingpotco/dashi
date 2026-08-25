import { type Element, RouteNavigation, type WrapperCtx } from "dashi";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <header id="chrome">chrome</header>
      <RouteNavigation>
        {children}
      </RouteNavigation>
    </html>
  );
}
