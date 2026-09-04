import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function statusOk({ html }: ReadArgs<Record<string, never>, AppState>) {
  return html(<p id="status-ok">handler-200</p>);
}
