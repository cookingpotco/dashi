import { client, type ReadArgs } from "dashi";

const Mark = client.element(
  "mark-el",
  new URL("./mark_client.ts", import.meta.url),
);

export function MarkPage({ html }: ReadArgs) {
  return html(<Mark />);
}
