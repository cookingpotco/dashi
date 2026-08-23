import { cached, CacheStrategy } from "dashi";

export function CachePublic() {
  return cached(
    <p id="cache-public">cached-public</p>,
    {
      strategy: CacheStrategy.Public,
      maxAge: 60,
      staleWhileRevalidate: 3600,
      staleIfError: 120,
      vary: ["Accept-Language"],
    },
  );
}
