import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CachePrivateCookie(_ctx: Ctx, html: Html) {
  return html(<p id="cache-private-cookie">cached-private-cookie</p>, {
    cache: {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  });
}
