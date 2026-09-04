import { type Ctx, type Html } from "dashi";

export function Search(ctx: Ctx, html: Html) {
  const q = ctx.url.searchParams.get("q") ?? "";
  return html(
    <div>
      <h1 id="heading">search</h1>
      <p id="query">{q}</p>
    </div>,
  );
}
