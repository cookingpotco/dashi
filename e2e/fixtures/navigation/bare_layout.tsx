import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "./state.ts";

export function BareLayout({ children }: LayoutArgs<AppState>): Element {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
