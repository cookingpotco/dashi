import { type Ctx, type Html, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function NestEmbed(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/nest-outer" />);
}
