import { type Ctx, type Html, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function CacheEmbed(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="cache-embed">
      <RouteFragment src="/cache-public" />
    </div>,
  );
}
