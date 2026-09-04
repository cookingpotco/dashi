import { CacheStrategy, type Ctx, type Html } from "dashi";

export function statusCached(_ctx: Ctx, html: Html) {
  return html(<p id="status-cached">handler-cached-404</p>, {
    status: 404,
    cache: { strategy: CacheStrategy.Public, maxAge: 30 },
  });
}
