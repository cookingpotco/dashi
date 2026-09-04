import { CacheStrategy, type ErrorArgs, group, type NotFoundArgs } from "dashi";
import type { AppState } from "../state.ts";

export const cacheBoundary = group<AppState>(
  "/cache-boundary",
  ({ route }) => ({
    notFound: CacheNotFound,
    error: CacheError,
    routes: [route("/throw", { GET: CacheBoundaryThrow })],
  }),
);

function CacheNotFound({ html }: NotFoundArgs<AppState>) {
  return html(<p id="cache-not-found">cached-not-found</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 90 },
  });
}

function CacheError({ html }: ErrorArgs<AppState>) {
  return html(<p id="cache-error">cached-error</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 45 },
  });
}

function CacheBoundaryThrow(): never {
  throw new Error("cache-boundary-boom");
}
