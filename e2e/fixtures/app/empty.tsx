import { RouteFragment } from "dashi";

export function Empty() {
  return (
    <RouteFragment
      src="/empty-fail"
      lazy
      fallback={<span id="empty-fallback">Loading empty...</span>}
    />
  );
}
