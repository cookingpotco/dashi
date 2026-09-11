import { type ReadArgs, RouteSlot } from "dashi";
import type { AppState } from "../state.ts";

export function Embed({ html }: ReadArgs<{ state: AppState }>) {
  return html(
    <div>
      <section id="connect">
        <RouteSlot src="/slot" />
        <RouteSlot src="/peer" />
      </section>
      <section id="visible">
        <RouteSlot
          src="/slot"
          fetchWhen="visible"
          fallback={<span id="fallback">Loading...</span>}
        />
      </section>
    </div>,
  );
}
