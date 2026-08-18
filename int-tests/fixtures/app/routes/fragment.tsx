import type { Ctx } from "dashi";
import type { AppState } from "../state.ts";

export default function Fragment(
  ctx: Ctx<Record<string, never>, AppState>,
) {
  return (
    <aside
      id="frag"
      data-pre={ctx.state.pre}
      data-embed-only={ctx.state.embedOnly ?? ""}
      data-frag={ctx.isFragment ? "1" : "0"}
    >
      eager-fragment-body
    </aside>
  );
}
