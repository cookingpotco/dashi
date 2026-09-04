import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CachePublicStar(_ctx: Ctx, html: Html) {
  return html(<p id="cache-public-star">cached-public-star</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["*"],
    },
  });
}
