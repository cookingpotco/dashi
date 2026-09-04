import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CacheCors(_ctx: Ctx, html: Html) {
  return html(<p id="cache-cors">cors-cached</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Accept-Language"],
    },
  });
}
