import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function NestedLayout({ children }: LayoutArgs): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
