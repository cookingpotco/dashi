import { type Ctx, RouteFragment, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function DistinctQuery(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(
    <div id="distinct-query">
      <div id="q-none">
        <RouteFragment src="/query-frag" />
      </div>
      <div id="q-one">
        <RouteFragment src="/query-frag?q=1" />
      </div>
    </div>,
  );
}
