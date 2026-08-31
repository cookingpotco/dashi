import { RouteFragment } from "dashi";

export function LazyNestEmbed() {
  return (
    <RouteFragment
      src="/lazy-nest"
      lazy
      fallback={<span id="lazy-nest-fallback">Loading nest...</span>}
    />
  );
}
