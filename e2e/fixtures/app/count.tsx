import { type Ctx, type Html, RouteFragment } from "dashi";

export function Count(_ctx: Ctx, html: Html) {
  return html(
    <RouteFragment
      src="/counted"
      lazy
      fallback={<span id="count-fallback">Loading count...</span>}
    />,
  );
}
