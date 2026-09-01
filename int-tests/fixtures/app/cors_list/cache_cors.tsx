import { cached, CacheStrategy } from "dashi";

export function CacheCors() {
  return cached(
    <p id="cache-cors">cors-cached</p>,
    {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      varyHeaders: ["Accept-Language"],
    },
  );
}
