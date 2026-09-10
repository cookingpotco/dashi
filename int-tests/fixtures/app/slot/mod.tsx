import { group, patch, type ReadArgs, type WriteArgs } from "dashi";
import type { AppState } from "../state.ts";

export const slot = group<AppState>(({ route }) => ({
  routes: [route("/slot", { GET: Slot, POST: post })],
}));

function Slot({ ctx, html }: ReadArgs<{ state: AppState }>) {
  return html(
    <aside id="slot" data-pre={ctx.state.pre}>
      slot-body
    </aside>,
  );
}

function post({ patches }: WriteArgs<{ state: AppState }>) {
  return patches([
    patch.update("#slot", <aside id="slot">posted-slot-body</aside>),
  ]);
}
