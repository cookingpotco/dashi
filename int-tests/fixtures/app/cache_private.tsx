import { CacheStrategy, type Ctx, type Html } from "dashi";

export function CachePrivate(_ctx: Ctx, html: Html) {
  return html(<p id="cache-private">cached-private</p>, {
    cache: {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      staleWhileRevalidate: 120,
    },
  });
}
