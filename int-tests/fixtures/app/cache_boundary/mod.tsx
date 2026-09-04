import {
  CacheStrategy,
  type Ctx,
  group,
  type Html,
  type WrapperCtx,
} from "dashi";
import type { AppState } from "../state.ts";

export const cacheBoundary = group<AppState>(
  "/cache-boundary",
  ({ route }) => ({
    notFound: CacheNotFound,
    error: CacheError,
    routes: [route("/throw", { GET: CacheBoundaryThrow })],
  }),
);

function CacheNotFound(_ctx: Ctx, html: Html) {
  return html(<p id="cache-not-found">cached-not-found</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 90 },
  });
}

function CacheError(
  _ctx: WrapperCtx<AppState>,
  _thrown: unknown,
  html: Html,
) {
  return html(<p id="cache-error">cached-error</p>, {
    cache: { strategy: CacheStrategy.Public, maxAge: 45 },
  });
}

function CacheBoundaryThrow(): never {
  throw new Error("cache-boundary-boom");
}
