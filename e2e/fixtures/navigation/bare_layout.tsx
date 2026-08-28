import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "./state.ts";

export function BareLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
): Element {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
