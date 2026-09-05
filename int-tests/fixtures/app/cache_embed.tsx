import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function CacheEmbed(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(
    <div id="cache-embed">
      <RouteFragment src="/cache-public" />
    </div>,
  );
}
