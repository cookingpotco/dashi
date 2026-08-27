import { cached, CacheStrategy } from "dashi";

export function CachePrivate() {
  return cached(
    <p id="cache-private">cached-private</p>,
    {
      strategy: CacheStrategy.Private,
      maxAge: 60,
      staleWhileRevalidate: 120,
    },
  );
}
