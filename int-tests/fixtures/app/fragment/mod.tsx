import {
  group,
  type MiddlewareArgs,
  patch,
  type ReadArgs,
  type WriteArgs,
} from "dashi";
import type { AppState } from "../state.ts";

function fragOnly({ ctx, next }: MiddlewareArgs<AppState>) {
  ctx.state.fragOnly = "yes";
  return next();
}

export const fragment = group<AppState>(({ route }) => ({
  middleware: [fragOnly],
  routes: [route("/fragment", { GET: Fragment, POST: post })],
}));

function Fragment({ ctx, html }: ReadArgs<AppState>) {
  return html(
    <aside
      id="frag"
      data-pre={ctx.state.pre}
      data-embed-only={ctx.state.embedOnly ?? ""}
      data-frag-only={ctx.state.fragOnly ?? ""}
      data-frag={ctx.isFragment ? "1" : "0"}
    >
      eager-fragment-body
    </aside>,
  );
}

function post({ patches }: WriteArgs<AppState>) {
  return patches([
    patch.replace(
      "/fragment",
      <aside id="frag">posted-fragment-body</aside>,
    ),
  ]);
}
