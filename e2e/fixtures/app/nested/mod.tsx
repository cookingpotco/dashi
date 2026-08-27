import { client, group } from "dashi";

const NestedMark = client.element(
  "nested-el",
  new URL("./nested_client.ts", import.meta.url),
);

export const nested = group("/nested", ({ route }) => ({
  routes: [route("/", { GET: NestedFrag })],
}));

function NestedFrag() {
  return <NestedMark />;
}
