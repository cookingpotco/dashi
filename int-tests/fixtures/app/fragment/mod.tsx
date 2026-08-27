import { type Ctx, fragment as actions, group, type Middleware } from "dashi";
import type { AppState } from "../state.ts";

const fragOnly: Middleware<AppState> = (ctx, next) => {
  ctx.state.fragOnly = "yes";
  return next();
};

export const fragment = group<AppState>(({ route }) => ({
  middleware: [fragOnly],
  routes: [route("/fragment", { GET: Fragment, POST: post })],
}));

function Fragment(
  ctx: Ctx<Record<string, never>, AppState>,
) {
  return (
    <aside
      id="frag"
      data-pre={ctx.state.pre}
      data-embed-only={ctx.state.embedOnly ?? ""}
      data-frag-only={ctx.state.fragOnly ?? ""}
      data-frag={ctx.isFragment ? "1" : "0"}
    >
      eager-fragment-body
    </aside>
  );
}

function post() {
  return [
    actions.replace(
      "/fragment",
      <aside id="frag">posted-fragment-body</aside>,
    ),
  ];
}
