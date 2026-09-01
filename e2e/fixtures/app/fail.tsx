import { RouteFragment } from "dashi";

export function Fail() {
  return (
    <RouteFragment
      src="/fail-frag"
      lazy
      fallback={<span id="fail-fallback">Loading fail...</span>}
    />
  );
}
