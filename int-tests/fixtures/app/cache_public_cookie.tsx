import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CachePublicCookie(_ctx: Ctx, html: Html) {
  return html(<p id="cache-public-cookie">cached-public-cookie</p>, {
    cache: {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  });
}
