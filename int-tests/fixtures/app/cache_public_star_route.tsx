import { cached, CacheStrategy } from "dashi";

export function CachePublicStar() {
  return cached(
    <p id="cache-public-star">cached-public-star</p>,
    {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["*"],
    },
  );
}
