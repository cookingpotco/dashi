import { type Ctx, type Html, RouteFragment } from "dashi";

export function Embed(_ctx: Ctx, html: Html) {
  return html(
    <div>
      <RouteFragment src="/eager" />
      <RouteFragment
        src="/lazy"
        lazy
        fallback={<span id="lazy-fallback">Loading...</span>}
      />
    </div>,
  );
}
