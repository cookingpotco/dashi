import { client, type Ctx, type SealHtml } from "dashi";

const Mark = client.element(
  "mark-el",
  new URL("./mark_client.ts", import.meta.url),
);

export function MarkPage(_ctx: Ctx, html: SealHtml) {
  return html(<Mark />);
}
