import { client, group, RouteFragment } from "dashi";

const EagerMark = client.element(
  "eager-el",
  new URL("./eager_client.ts", import.meta.url),
);

export const eager = group("/eager", ({ route }) => ({
  routes: [route("/", { GET: EagerFrag })],
}));

function EagerFrag() {
  return (
    <div>
      <EagerMark />
      <RouteFragment src="/nested" />
    </div>
  );
}
