import { group, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export const slot = group<AppState>(({ route }) => ({
  routes: [route("/slot", { GET: Slot })],
}));

function Slot({ ctx, html }: ReadArgs<{ state: AppState }>) {
  return html(
    <aside id="slot" data-pre={ctx.state.pre}>
      slot-body
    </aside>,
  );
}
