import { type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

export function QueryFrag(
  ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  const q = ctx.url.searchParams.get("q") ?? "none";
  return html(<p id={`query-frag-${q}`}>{`query-frag-${q}`}</p>);
}
