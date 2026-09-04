import { type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function QueryFrag(
  { ctx, html }: ReadArgs<Record<string, never>, AppState>,
) {
  const q = ctx.url.searchParams.get("q") ?? "none";
  return html(<p id={`query-frag-${q}`}>{`query-frag-${q}`}</p>);
}
