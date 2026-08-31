import { cached, CacheStrategy } from "dashi";

export function CachePrivateCookie() {
  return cached(
    <p id="cache-private-cookie">cached-private-cookie</p>,
    {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  );
}
