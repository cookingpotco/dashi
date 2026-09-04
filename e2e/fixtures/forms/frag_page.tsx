import { type ReadArgs, RouteFragment } from "dashi";

export function FragPage({ html }: ReadArgs) {
  return html(
    <div>
      <h1 id="heading">frag-page</h1>
      <p id="page-marker">outside</p>
      <RouteFragment src="/frag" />
      <RouteFragment src="/frag-leave" />
    </div>,
  );
}
