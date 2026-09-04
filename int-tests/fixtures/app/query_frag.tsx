import { type Ctx, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function QueryFrag(
  ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  const q = ctx.url.searchParams.get("q") ?? "none";
  return html(<p id={`query-frag-${q}`}>{`query-frag-${q}`}</p>);
}
