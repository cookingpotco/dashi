import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function NestInner({ html }: ReadArgs<{ state: AppState }>) {
  return html(<p id="nested-slot">nested-slot-body</p>);
}
