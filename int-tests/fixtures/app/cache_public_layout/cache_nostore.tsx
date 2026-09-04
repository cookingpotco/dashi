import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CacheNoStore(_ctx: Ctx, html: Html) {
  return html(<p id="cache-nostore">cached-nostore</p>, {
    cache: { strategy: CacheStrategy.NoStore },
  });
}
