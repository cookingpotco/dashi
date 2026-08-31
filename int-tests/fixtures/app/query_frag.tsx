import { type Ctx } from "dashi";
import type { AppState } from "./state.ts";

export function QueryFrag(
  ctx: Ctx<Record<string, never>, AppState>,
) {
  const q = ctx.url.searchParams.get("q") ?? "none";
  return <p id={`query-frag-${q}`}>{`query-frag-${q}`}</p>;
}
