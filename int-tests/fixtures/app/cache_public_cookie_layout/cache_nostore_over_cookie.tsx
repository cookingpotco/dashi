import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CacheNoStoreOverCookie(_ctx: Ctx, html: Html) {
  return html(
    <p id="cache-nostore-over-cookie">cached-nostore-over-cookie</p>,
    {
      cache: { strategy: CacheStrategy.NoStore },
    },
  );
}
