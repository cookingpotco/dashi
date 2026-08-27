import { cached, CacheStrategy } from "dashi";

export function CacheNoStoreOverCookie() {
  return cached(
    <p id="cache-nostore-over-cookie">cached-nostore-over-cookie</p>,
    { strategy: CacheStrategy.NoStore },
  );
}
