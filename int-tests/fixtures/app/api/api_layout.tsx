import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function ApiLayout({ children }: LayoutArgs<AppState>): Element {
  return <div id="api-wrap">{children}</div>;
}
