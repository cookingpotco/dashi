import { type ReadArgs, RouteSlot } from "dashi";

export function FragPage({ html }: ReadArgs) {
  return html(
    <div>
      <h1 id="heading">frag-page</h1>
      <p id="page-marker">outside</p>
      <RouteSlot src="/frag" />
      <RouteSlot src="/frag-leave" />
    </div>,
  );
}
