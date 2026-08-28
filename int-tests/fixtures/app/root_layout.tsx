import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "./state.ts";

export function RootLayout(
  ctx: WrapperCtx<AppState>,
  children: Element,
): Element {
  if (
    ctx.url.pathname === "/root-layout-throws" ||
    ctx.url.pathname === "/miss-layout-throws"
  ) {
    throw new Error("root-layout");
  }
  return (
    <html>
      <h1>Website Title</h1>
      <p id="pre">{ctx.state.pre}</p>
      {children}
    </html>
  );
}
