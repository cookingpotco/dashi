import { type Ctx, RouteFragment, type SealHtml } from "dashi";

export function Fail(_ctx: Ctx, html: SealHtml) {
  return html(
    <RouteFragment
      src="/fail-frag"
      lazy
      fallback={<span id="fail-fallback">Loading fail...</span>}
    />,
  );
}
