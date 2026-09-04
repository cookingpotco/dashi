import { client, type ReadArgs } from "dashi";

const NestedMark = client.element(
  "nested-el",
  new URL("./nested_client.ts", import.meta.url),
);

export function NestedFrag({ html }: ReadArgs) {
  return html(<NestedMark />);
}
