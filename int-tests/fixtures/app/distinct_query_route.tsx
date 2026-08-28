import { type Ctx, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function QueryFrag(
  ctx: Ctx<Record<string, never>, AppState>,
) {
  const q = ctx.url.searchParams.get("q") ?? "none";
  return <p id={`query-frag-${q}`}>{`query-frag-${q}`}</p>;
}

export function DistinctQuery() {
  return (
    <div id="distinct-query">
      <div id="q-none">
        <RouteFragment src="/query-frag" />
      </div>
      <div id="q-one">
        <RouteFragment src="/query-frag?q=1" />
      </div>
    </div>
  );
}
