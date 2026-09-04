import { type Ctx, type Html } from "dashi";

export function Secret(_ctx: Ctx, html: Html) {
  return html(
    <html>
      <h2>{"<3"}</h2>
    </html>,
  );
}
