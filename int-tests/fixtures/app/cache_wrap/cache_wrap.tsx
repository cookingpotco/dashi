import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function CacheWrap({ children }: LayoutArgs<AppState>): Element {
  return <div id="cache-wrap">{children}</div>;
}
