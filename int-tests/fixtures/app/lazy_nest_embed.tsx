import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function LazyNestEmbed(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(
    <RouteFragment
      src="/lazy-nest"
      lazy
      fallback={<span id="lazy-nest-fallback">Loading nest...</span>}
    />,
  );
}
