import { type Ctx, type Html, RouteFragment } from "dashi";

export function Fail(_ctx: Ctx, html: Html) {
  return html(
    <RouteFragment
      src="/fail-frag"
      lazy
      fallback={<span id="fail-fallback">Loading fail...</span>}
    />,
  );
}
