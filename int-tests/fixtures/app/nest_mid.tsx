import { type Ctx, type Html, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function NestMid(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="nest-mid">
      <RouteFragment src="/nest-inner" />
    </div>,
  );
}
