import { type Ctx, RouteFragment, type SealHtml } from "dashi";

export function Embed(_ctx: Ctx, html: SealHtml) {
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
