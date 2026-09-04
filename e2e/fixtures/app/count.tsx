import { type ReadArgs, RouteFragment } from "dashi";

export function Count({ html }: ReadArgs) {
  return html(
    <RouteFragment
      src="/counted"
      lazy
      fallback={<span id="count-fallback">Loading count...</span>}
    />,
  );
}
