import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function Peer({ ctx, html }: ReadArgs<AppState>) {
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
