import { client, type Ctx, type Html } from "dashi";

const LazyMark = client.element(
  "lazy-el",
  new URL("./lazy_client.ts", import.meta.url),
);

export function LazyFrag(_ctx: Ctx, html: Html) {
  return html(<LazyMark />);
}
