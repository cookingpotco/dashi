import { type Ctx, type Html, RouteFragment } from "dashi";

export function DistinctQuery(_ctx: Ctx, html: Html) {
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
