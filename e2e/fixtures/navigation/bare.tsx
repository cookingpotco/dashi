import { type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function Bare({ html }: ReadArgs<Record<string, never>, AppState>) {
  return html(<p id="heading">bare</p>);
}
