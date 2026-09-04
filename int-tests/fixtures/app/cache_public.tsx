import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CachePublic(_ctx: Ctx, html: Html) {
  return html(<p id="cache-public">cached-public</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      staleWhileRevalidate: 3600,
      staleIfError: 120,
      varyHeaders: ["Accept-Language"],
    },
  });
}
