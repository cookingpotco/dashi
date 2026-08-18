import { type Element, type LayoutCtx } from "dashi";
import type { AppState } from "../state.ts";

export default function RootLayout(
  ctx: LayoutCtx<AppState>,
  children: Element,
): Element {
  return (
    <html>
      <h1>Website Title</h1>
      <p id="pre">{ctx.state.pre}</p>
      {children}
    </html>
  );
}
