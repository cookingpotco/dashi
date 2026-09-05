import { type ReadArgs, RouteFragment } from "dashi";
import type { AppState } from "./state.ts";

export function DupSrc({ html }: ReadArgs<{ state: AppState }>) {
  return html(
    <div id="dup-src">
      <div id="dup-a">
        <RouteFragment src="/nest-inner" />
      </div>
      <div id="dup-b">
        <RouteFragment src="/nest-inner" />
      </div>
      <div id="dup-c">
        <RouteFragment src="/./nest-inner" />
      </div>
      <div id="dup-d">
        <RouteFragment src="/nest-inner?" />
      </div>
    </div>,
  );
}
