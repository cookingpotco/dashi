import { type ReadArgs, RouteFragment } from "dashi";

export function Embed({ html }: ReadArgs) {
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
