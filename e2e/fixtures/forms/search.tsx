import { type ReadArgs } from "dashi";

export function Search({ ctx, html }: ReadArgs) {
  const q = ctx.url.searchParams.get("q") ?? "";
  return html(
    <div>
      <h1 id="heading">search</h1>
      <p id="query">{q}</p>
    </div>,
  );
}
