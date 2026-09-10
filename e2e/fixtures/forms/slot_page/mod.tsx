import { type ReadArgs, RouteSlot } from "dashi";

export function SlotPage({ html }: ReadArgs) {
  return html(
    <div>
      <h1 id="heading">slot-page</h1>
      <p id="page-marker">outside</p>
      <RouteSlot src="/slot-hole" />
      <RouteSlot src="/slot-leave" />
    </div>,
  );
}
