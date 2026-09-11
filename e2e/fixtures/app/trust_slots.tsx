import { type ReadArgs, RouteSlot } from "dashi";

export function TrustSlots({ html }: ReadArgs) {
  return html(
    <div>
      <RouteSlot
        src="/slot"
        fallback={<span id="good-fallback">loading</span>}
      />
      <RouteSlot
        src="/slot-json"
        fallback={<span id="json-fallback">json-fallback</span>}
      />
      <RouteSlot
        src="/slot-redirect-away"
        fallback={<span id="redirect-fallback">redirect-fallback</span>}
      />
    </div>,
  );
}
