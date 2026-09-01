import { RouteFragment } from "dashi";

export function Count() {
  return (
    <RouteFragment
      src="/counted"
      lazy
      fallback={<span id="count-fallback">Loading count...</span>}
    />
  );
}
