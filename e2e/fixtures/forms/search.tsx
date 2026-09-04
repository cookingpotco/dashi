import { type Ctx, type SealHtml } from "dashi";

export function Search(ctx: Ctx, html: SealHtml) {
  const q = ctx.url.searchParams.get("q") ?? "";
  return html(
    <div>
      <h1 id="heading">search</h1>
      <p id="query">{q}</p>
    </div>,
  );
}
