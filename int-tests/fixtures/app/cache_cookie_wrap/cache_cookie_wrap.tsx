import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "../state.ts";

export function CacheCookieWrap({ children }: LayoutArgs<AppState>): Element {
  return <div id="cache-cookie-wrap">{children}</div>;
}
