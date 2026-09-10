import { type ReadArgs, RouteSlot } from "dashi";
import type { AppState } from "./state.ts";

export function NestLazyEmbed({ html }: ReadArgs<{ state: AppState }>) {
  return html(
    <RouteSlot
      src="/nest-lazy"
      fetchWhen="visible"
      fallback={<span id="nest-lazy-fallback">Loading nest...</span>}
    />,
  );
}
