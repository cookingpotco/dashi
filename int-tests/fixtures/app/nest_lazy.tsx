import { type ReadArgs, RouteSlot } from "dashi";
import type { AppState } from "./state.ts";

export function NestLazy({ html }: ReadArgs<{ state: AppState }>) {
  return html(<RouteSlot src="/nest-inner" />);
}
