import { type Ctx } from "dashi";

export function Search(ctx: Ctx) {
  const q = ctx.url.searchParams.get("q") ?? "";
  return (
    <div>
      <h1 id="heading">search</h1>
      <p id="query">{q}</p>
    </div>
  );
}
