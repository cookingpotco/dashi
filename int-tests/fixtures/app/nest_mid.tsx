import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function NestMid({ html }: ReadArgs<AppState>) {
  return html(
    <div id="nest-mid">
      <RouteFragment src="/nest-inner" />
    </div>,
  );
}
