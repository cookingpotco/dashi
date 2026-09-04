import { type Ctx, type Html, RouteFragment } from "dashi";

export function FragPage(_ctx: Ctx, html: Html) {
  return html(
    <div>
      <h1 id="heading">frag-page</h1>
      <p id="page-marker">outside</p>
      <RouteFragment src="/frag" />
      <RouteFragment src="/frag-leave" />
    </div>,
  );
}
