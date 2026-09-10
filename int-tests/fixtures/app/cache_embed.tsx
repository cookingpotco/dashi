import { type ReadArgs, RouteSlot } from "dashi";
import type { AppState } from "./state.ts";

export function CacheEmbed(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(
    <div id="cache-embed">
      <RouteSlot src="/cache-public" />
    </div>,
  );
}
