import { type Ctx, type SealHtml } from "dashi";

export function Secret(_ctx: Ctx, html: SealHtml) {
  return html(
    <html>
      <h2>{"<3"}</h2>
    </html>,
  );
}
