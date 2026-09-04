import { type ReadArgs, RouteFragment } from "dashi";

export function Empty({ html }: ReadArgs) {
  return html(
    <RouteFragment
      src="/empty-fail"
      lazy
      fallback={<span id="empty-fallback">Loading empty...</span>}
    />,
  );
}
