import { group, RouteFragment } from "dashi";

export const empty = group("/empty", ({ route }) => ({
  routes: [route("/", { GET: Empty })],
}));

function Empty() {
  return (
    <RouteFragment
      src="/empty-fail"
      lazy
      fallback={<span id="empty-fallback">Loading empty...</span>}
    />
  );
}
