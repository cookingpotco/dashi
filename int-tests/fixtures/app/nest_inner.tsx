import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function NestInner({ html }: ReadArgs<Record<string, never>, AppState>) {
  return html(<p id="nested-frag">nested-fragment-body</p>);
}
