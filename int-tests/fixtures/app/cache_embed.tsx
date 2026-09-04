import { type Ctx, RouteFragment, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function CacheEmbed(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(
    <div id="cache-embed">
      <RouteFragment src="/cache-public" />
    </div>,
  );
}
