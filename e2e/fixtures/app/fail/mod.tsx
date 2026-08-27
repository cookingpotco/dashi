import { group, RouteFragment } from "dashi";

export const fail = group("/fail", ({ route }) => ({
  routes: [route("/", { GET: Fail })],
}));

function Fail() {
  return (
    <RouteFragment
      src="/fail-frag"
      lazy
      fallback={<span id="fail-fallback">Loading fail...</span>}
    />
  );
}
