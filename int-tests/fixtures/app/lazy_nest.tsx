import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function LazyNest({ html }: ReadArgs<Record<string, never>, AppState>) {
  return html(<RouteFragment src="/nest-inner" />);
}
