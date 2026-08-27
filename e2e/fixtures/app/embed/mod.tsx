import { group, RouteFragment } from "dashi";

export const embed = group("/embed", ({ route }) => ({
  routes: [route("/", { GET: Embed })],
}));

function Embed() {
  return (
    <div>
      <RouteFragment src="/eager" />
      <RouteFragment
        src="/lazy"
        lazy
        fallback={<span id="lazy-fallback">Loading...</span>}
      />
    </div>
  );
}
