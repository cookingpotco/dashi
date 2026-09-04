import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CacheOverride(_ctx: Ctx, html: Html) {
  return html(<p id="cache-override">route-wins</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 60 },
  });
}
