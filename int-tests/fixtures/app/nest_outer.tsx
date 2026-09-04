import { type Ctx, type Html, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function NestOuter(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="nest-outer">
      <RouteFragment src="/nest-mid" />
    </div>,
  );
}
