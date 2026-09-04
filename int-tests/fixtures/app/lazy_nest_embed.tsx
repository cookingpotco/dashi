import { type Ctx, type Html, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function LazyNestEmbed(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <RouteFragment
      src="/lazy-nest"
      lazy
      fallback={<span id="lazy-nest-fallback">Loading nest...</span>}
    />,
  );
}
