import {
  type Ctx,
  group,
  patch,
  type SealHtml,
  type SealPatches,
  type WrapperCtx,
} from "dashi";
import type { AppState } from "../state.ts";

function fragOnly(ctx: WrapperCtx<AppState>, next: () => Promise<Response>) {
  ctx.state.fragOnly = "yes";
  return next();
}

export const fragment = group<AppState>(({ route }) => ({
  middleware: [fragOnly],
  routes: [route("/fragment", { GET: Fragment, POST: post })],
}));

function Fragment(
  ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
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

function post(
  _ctx: Ctx<Record<string, never>, AppState>,
  patches: SealPatches,
) {
  return patches([
    patch.replace(
      "/fragment",
      <aside id="frag">posted-fragment-body</aside>,
    ),
  ]);
}
