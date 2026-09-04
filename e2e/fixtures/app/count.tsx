import { type Ctx, RouteFragment, type SealHtml } from "dashi";

export function Count(_ctx: Ctx, html: SealHtml) {
  return html(
    <RouteFragment
      src="/counted"
      lazy
      fallback={<span id="count-fallback">Loading count...</span>}
    />,
  );
}
