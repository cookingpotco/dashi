import { client, type ReadArgs } from "dashi";

const Paint = client.module(
  new URL("./paint_client.ts", import.meta.url),
);

export function PaintPage({ html }: ReadArgs) {
  return html(
    <div>
      <p id="paint-target">pending</p>
      <Paint />
    </div>,
  );
}
