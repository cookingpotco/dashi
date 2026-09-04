import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function Peer(
  ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <aside
      id="peer"
      data-embed-only={ctx.state.embedOnly ?? ""}
      data-frag-only={ctx.state.fragOnly ?? ""}
    >
      peer-body
    </aside>,
  );
}
