import { type Ctx, type Html, RouteFragment } from "dashi";

export function LazyNestEmbed(_ctx: Ctx, html: Html) {
  return html(
    <RouteFragment
      src="/lazy-nest"
      lazy
      fallback={<span id="lazy-nest-fallback">Loading nest...</span>}
    />,
  );
}
