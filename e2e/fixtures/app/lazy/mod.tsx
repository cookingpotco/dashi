import { client, group } from "dashi";

const LazyMark = client.element(
  "lazy-el",
  new URL("./lazy_client.ts", import.meta.url),
);

export const lazy = group("/lazy", ({ route }) => ({
  routes: [route("/", { GET: LazyFrag })],
}));

function LazyFrag() {
  return <LazyMark />;
}
