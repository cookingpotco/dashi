import type { Ctx } from "dashi";
import type { AppState } from "./state.ts";

export function Peer(
  ctx: Ctx<Record<string, never>, AppState>,
) {
  return (
    <aside
      id="peer"
      data-embed-only={ctx.state.embedOnly ?? ""}
      data-frag-only={ctx.state.fragOnly ?? ""}
    >
      peer-body
    </aside>
  );
}
