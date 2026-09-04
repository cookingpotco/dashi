import { client, type Ctx, type Html } from "dashi";

const Mark = client.element(
  "mark-el",
  new URL("./mark_client.ts", import.meta.url),
);

export function MarkPage(_ctx: Ctx, html: Html) {
  return html(<Mark />);
}
