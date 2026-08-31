import { cached, CacheStrategy } from "dashi";

export function CachePublicCookie() {
  return cached(
    <p id="cache-public-cookie">cached-public-cookie</p>,
    {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Cookie"],
    },
  );
}
