import {
  group,
  type MiddlewareArgs,
  patch,
  type ReadArgs,
  type WriteArgs,
} from "dashi";
import type { AppState } from "../state.ts";

function slotOnly({ ctx, next }: MiddlewareArgs<AppState>) {
  ctx.state.fragOnly = "yes";
  return next();
}

export const slot = group<AppState>(({ route }) => ({
  middleware: [slotOnly],
  routes: [route("/slot", { GET: Slot, POST: post })],
}));

function Slot({ ctx, html }: ReadArgs<{ state: AppState }>) {
  return html(
    <aside
      id="frag"
      data-pre={ctx.state.pre}
      data-embed-only={ctx.state.embedOnly ?? ""}
      data-frag-only={ctx.state.fragOnly ?? ""}
    >
      slot-body
    </aside>,
  );
}

function post({ patches }: WriteArgs<{ state: AppState }>) {
  return patches([
    patch.update("#frag", <aside id="frag">posted-slot-body</aside>),
  ]);
}
