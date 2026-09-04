import { client, type ReadArgs } from "dashi";

const LazyMark = client.element(
  "lazy-el",
  new URL("./lazy_client.ts", import.meta.url),
);

export function LazyFrag({ html }: ReadArgs) {
  return html(<LazyMark />);
}
