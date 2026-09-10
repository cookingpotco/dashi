import { type ReadArgs, RouteSlot } from "dashi";
import type { AppState } from "./state.ts";

export function LazyNestEmbed(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(
    <RouteSlot
      src="/lazy-nest"
      fetchWhen="visible"
      fallback={<span id="lazy-nest-fallback">Loading nest...</span>}
    />,
  );
}
