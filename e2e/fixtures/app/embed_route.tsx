import { RouteFragment } from "dashi";

export function Embed() {
  return (
    <div>
      <RouteFragment src="/eager" />
      <RouteFragment
        src="/lazy"
        lazy
        fallback={<span id="lazy-fallback">Loading...</span>}
      />
    </div>
  );
}
