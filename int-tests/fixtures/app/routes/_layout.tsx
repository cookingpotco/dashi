import { type Element, type WrapCtx } from "dashi";
import type { AppState } from "../state.ts";

export default function RootLayout(
  ctx: WrapCtx<AppState>,
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
