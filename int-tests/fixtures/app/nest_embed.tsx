import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function NestEmbed({ html }: ReadArgs<{ state: AppState }>) {
  return html(<RouteFragment src="/nest-outer" />);
}
