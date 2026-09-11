import { type ReadArgs, RouteSlot } from "dashi";
import type { AppState } from "./state.ts";

export function NestEmbed({ html }: ReadArgs<{ state: AppState }>) {
  return html(<RouteSlot src="/nest-lazy" />);
}
