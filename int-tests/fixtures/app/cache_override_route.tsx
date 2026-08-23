import { cached, CacheStrategy } from "dashi";

export function CacheOverride() {
  return cached(
    <p id="cache-override">route-wins</p>,
    { strategy: CacheStrategy.Public, maxAge: 60 },
  );
}
