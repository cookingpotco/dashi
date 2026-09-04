import { type Ctx, RouteFragment, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function NestMid(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(
    <div id="nest-mid">
      <RouteFragment src="/nest-inner" />
    </div>,
  );
}
