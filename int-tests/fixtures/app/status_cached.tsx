import { cached, CacheStrategy, status } from "dashi";

export function statusCached() {
  return status(
    404,
    cached(
      <p id="status-cached">handler-cached-404</p>,
      { strategy: CacheStrategy.Public, maxAge: 30 },
    ),
  );
}
