import { client, type Ctx, type Html } from "dashi";

const Paint = client.module(
  new URL("./paint_client.ts", import.meta.url),
);

export function PaintPage(_ctx: Ctx, html: Html) {
  return html(
    <div>
      <p id="paint-target">pending</p>
      <Paint />
    </div>,
  );
}
