import { type Ctx, type SealHtml } from "dashi";

export function Wrote(_ctx: Ctx, html: SealHtml) {
  return html(
    <div>
      <h1 id="heading">wrote</h1>
    </div>,
  );
}
