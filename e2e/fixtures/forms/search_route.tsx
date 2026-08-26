import { client, type Ctx } from "dashi";

const SearchEl = client.element(
  "search-el",
  new URL("./search_client.ts", import.meta.url),
);

export function Search(ctx: Ctx) {
  const q = ctx.url.searchParams.get("q") ?? "";
  return (
    <div>
      <h1 id="heading">search</h1>
      <p id="query">{q}</p>
      <SearchEl id="search-mark-a" />
      <SearchEl id="search-mark-b" />
    </div>
  );
}
