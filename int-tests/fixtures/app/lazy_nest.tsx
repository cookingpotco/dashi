import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function LazyNest({ html }: ReadArgs<AppState>) {
  return html(<RouteFragment src="/nest-inner" />);
}
