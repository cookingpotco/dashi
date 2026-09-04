import { type Ctx, RouteFragment, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function NestEmbed(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(<RouteFragment src="/nest-outer" />);
}
