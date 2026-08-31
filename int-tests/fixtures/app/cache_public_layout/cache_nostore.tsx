import { cached, CacheStrategy } from "dashi";

export function CacheNoStore() {
  return cached(
    <p id="cache-nostore">cached-nostore</p>,
    { strategy: CacheStrategy.NoStore },
  );
}
