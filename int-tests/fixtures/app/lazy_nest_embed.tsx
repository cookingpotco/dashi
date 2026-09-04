import { type Ctx, RouteFragment, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function LazyNestEmbed(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(
    <RouteFragment
      src="/lazy-nest"
      lazy
      fallback={<span id="lazy-nest-fallback">Loading nest...</span>}
    />,
  );
}
