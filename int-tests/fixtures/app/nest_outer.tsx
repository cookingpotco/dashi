import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function NestOuter({ html }: ReadArgs<AppState>) {
  return html(
    <div id="nest-outer">
      <RouteFragment src="/nest-mid" />
    </div>,
  );
}
