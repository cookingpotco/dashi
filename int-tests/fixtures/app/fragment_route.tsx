import { type Ctx, fragment } from "dashi";
import type { AppState } from "./state.ts";

export function Fragment(
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

export function post() {
  return [
    fragment.replace("/fragment", <aside id="frag">posted-fragment-body</aside>),
  ];
}
