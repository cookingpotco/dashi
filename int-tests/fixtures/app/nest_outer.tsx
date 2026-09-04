import { type Ctx, RouteFragment, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function NestOuter(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(
    <div id="nest-outer">
      <RouteFragment src="/nest-mid" />
    </div>,
  );
}
