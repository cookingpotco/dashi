import { client, group } from "dashi";

const Mark = client.element(
  "mark-el",
  new URL("./mark_client.ts", import.meta.url),
);

export const mark = group("/mark", ({ route }) => ({
  routes: [route("/", { GET: MarkPage })],
}));

function MarkPage() {
  return <Mark />;
}
