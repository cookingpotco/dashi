import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function NestedLayout({ children }: LayoutArgs<AppState>): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
