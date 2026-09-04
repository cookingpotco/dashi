import { client, type Ctx, type SealHtml } from "dashi";

const NestedMark = client.element(
  "nested-el",
  new URL("./nested_client.ts", import.meta.url),
);

export function NestedFrag(_ctx: Ctx, html: SealHtml) {
  return html(<NestedMark />);
}
