import { type Ctx, type Html } from "dashi";

export function Wrote(_ctx: Ctx, html: Html) {
  return html(
    <div>
      <h1 id="heading">wrote</h1>
    </div>,
  );
}
