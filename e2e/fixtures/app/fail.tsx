import { type ReadArgs, RouteFragment } from "dashi";

export function Fail({ html }: ReadArgs) {
  return html(
    <RouteFragment
      src="/fail-frag"
      lazy
      fallback={<span id="fail-fallback">Loading fail...</span>}
    />,
  );
}
