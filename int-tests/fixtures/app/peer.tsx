import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function Peer({ html }: ReadArgs<{ state: AppState }>) {
  return html(
    <aside id="peer">
      peer-body
    </aside>,
  );
}
