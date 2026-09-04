import { client, type Ctx, type Html } from "dashi";

const NestedMark = client.element(
  "nested-el",
  new URL("./nested_client.ts", import.meta.url),
);

export function NestedFrag(_ctx: Ctx, html: Html) {
  return html(<NestedMark />);
}
