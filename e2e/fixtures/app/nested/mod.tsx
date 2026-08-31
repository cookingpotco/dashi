import { client } from "dashi";

const NestedMark = client.element(
  "nested-el",
  new URL("./nested_client.ts", import.meta.url),
);

export function NestedFrag() {
  return <NestedMark />;
}
