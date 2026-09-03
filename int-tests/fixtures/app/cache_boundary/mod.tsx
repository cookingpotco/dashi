import { cached, CacheStrategy, group } from "dashi";
import type { AppState } from "../state.ts";

export const cacheBoundary = group<AppState>(
  "/cache-boundary",
  ({ route }) => ({
    notFound: CacheNotFound,
    error: CacheError,
    routes: [route("/throw", { GET: CacheBoundaryThrow })],
  }),
);

function CacheNotFound() {
  return cached(
    <p id="cache-not-found">cached-not-found</p>,
    { strategy: CacheStrategy.Public, maxAge: 90 },
  );
}

function CacheError() {
  return cached(
    <p id="cache-error">cached-error</p>,
    { strategy: CacheStrategy.Public, maxAge: 45 },
  );
}

function CacheBoundaryThrow(): never {
  throw new Error("cache-boundary-boom");
}
