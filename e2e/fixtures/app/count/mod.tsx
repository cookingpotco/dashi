import { group, RouteFragment } from "dashi";

export const count = group("/count", ({ route }) => ({
  routes: [route("/", { GET: Count })],
}));

function Count() {
  return (
    <RouteFragment
      src="/counted"
      lazy
      fallback={<span id="count-fallback">Loading count...</span>}
    />
  );
}
