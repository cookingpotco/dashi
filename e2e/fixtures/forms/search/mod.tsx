import { type Ctx, group } from "dashi";

export const search = group("/search", ({ route }) => ({
  routes: [route("/", { GET: Search })],
}));

function Search(ctx: Ctx) {
  const q = ctx.url.searchParams.get("q") ?? "";
  return (
    <div>
      <h1 id="heading">search</h1>
      <p id="query">{q}</p>
    </div>
  );
}
