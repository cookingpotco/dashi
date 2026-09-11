import { type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function Slot({ ctx, html }: ReadArgs<{ state: AppState }>) {
  return html(
    <aside id="slot" data-pre={ctx.state.pre}>
      slot-body
    </aside>,
  );
}
