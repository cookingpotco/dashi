import {
  type Ctx,
  type Middleware,
  serve,
  staticFile,
  StaticFileCacheStrategy,
} from "dashi";
import { cors } from "dashi/cors";
import type { AppState } from "./state.ts";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { root } from "./root_middleware.ts";
import { Nested } from "./nested_route.tsx";
import { NestedLayout } from "./nested_layout.tsx";
import { ApiLayout } from "./api_layout.tsx";
import { Echo } from "./echo_route.tsx";
import { Embed } from "./embed_route.tsx";
import { Fragment } from "./fragment_route.tsx";
import { Peer } from "./peer_route.tsx";
import { PostsNew } from "./posts_new_route.tsx";
import { Post } from "./post_route.tsx";
import {
  add as addGuestbook,
  list as listGuestbook,
} from "./guestbook_route.tsx";
import { ok } from "./ok_route.ts";
import { Gated } from "./gated_route.tsx";
import {
  ApiNotFound,
  ApiV2NotFound,
  compactError,
  embedFragError,
  embedFragErrorResponse,
  embedFragErrorThrows,
  embedFragMiss,
  embedFragThrow,
  errorFallback,
  jsonError,
  nestedError,
  nestedErrorLayout,
  nestedMw,
  noErrorLayout,
  NotFound,
  okPage,
  responseError,
  RootError,
  throwErrorHandlerBoom,
  throwHandler,
  throwingError,
  throwingLayout,
  throwingMw,
} from "./errors.tsx";

const embedOnly: Middleware<AppState> = (ctx, next) => {
  ctx.state.embedOnly = "yes";
  return next();
};

const fragOnly: Middleware<AppState> = (ctx, next) => {
  ctx.state.fragOnly = "yes";
  return next();
};

const requireSession: Middleware<AppState> = (ctx, next) => {
  if (!ctx.req.headers.get("cookie")?.includes("session=")) {
    return Response.redirect(new URL("/", ctx.url), 303);
  }
  return next();
};

const apiMw: Middleware<AppState> = async (_ctx, next) => {
  const res = await next();
  res.headers.set("x-api", "1");
  return res;
};

const staticDir = `${import.meta.dirname}/static`;
const files = (ctx: Ctx<{ path: string }, AppState>) =>
  staticFile(ctx, staticDir, ctx.params.path);
const hour = (ctx: Ctx<{ path: string }, AppState>) =>
  staticFile(ctx, staticDir, ctx.params.path, {
    strategy: StaticFileCacheStrategy.Public,
    maxAge: 3600,
    sMaxAge: 86400,
  });
const priv = (ctx: Ctx<{ path: string }, AppState>) =>
  staticFile(ctx, staticDir, ctx.params.path, {
    strategy: StaticFileCacheStrategy.Private,
  });
const missingDir = (ctx: Ctx<{ path: string }, AppState>) =>
  staticFile(
    ctx,
    `${import.meta.dirname}/no-such-static`,
    ctx.params.path,
  );

if (import.meta.main) {
  serve<AppState>(({ route, group }) => ({
    layouts: [RootLayout],
    middleware: [root],
    notFound: NotFound,
    error: RootError,
    routes: [
      route("/", { GET: Home }),
      group(({ route }) => ({
        layouts: [NestedLayout],
        routes: [route("/nested", { GET: Nested })],
      })),
      route("/echo", { GET: Echo }),
      group(({ route }) => ({
        middleware: [embedOnly],
        routes: [route("/embed", { GET: Embed })],
      })),
      group(({ route }) => ({
        middleware: [fragOnly],
        routes: [route("/fragment", { GET: Fragment })],
      })),
      route("/peer", { GET: Peer }),
      route("/posts/new", { GET: PostsNew }),
      route("/posts/:id", { GET: Post }),
      route("/guestbook", { GET: listGuestbook, POST: addGuestbook }),
      route("/ok", { GET: ok }),
      group("/api", ({ route, group }) => ({
        layouts: [ApiLayout],
        middleware: [apiMw],
        notFound: ApiNotFound,
        routes: [
          route("/ok", { GET: ok }),
          group("/v2", ({ route }) => ({
            notFound: ApiV2NotFound,
            routes: [route("/ok", { GET: ok })],
          })),
        ],
      })),
      group(({ route }) => ({
        middleware: [cors()],
        routes: [route("/cors-star", { GET: ok })],
      })),
      group(({ route }) => ({
        middleware: [cors({
          origin: ["https://app.example", "https://other.example"],
        })],
        routes: [route("/cors-list", { GET: ok })],
      })),
      group(({ route }) => ({
        middleware: [cors({
          origin: (origin) =>
            origin === "https://app.example" ? origin : undefined,
        })],
        routes: [route("/cors-fn", { GET: ok })],
      })),
      route("/static/:path*", { GET: files }),
      route("/static-public/:path*", { GET: hour }),
      route("/static-private/:path*", { GET: priv }),
      route("/static-missing-dir/:path*", { GET: missingDir }),
      group(({ route }) => ({
        middleware: [requireSession],
        routes: [route("/gated", { GET: Gated })],
      })),
      route("/throw", { GET: throwHandler }),
      route("/root-layout-throws", { GET: okPage }),
      route("/root-error-throws", { GET: throwErrorHandlerBoom }),
      group(({ route }) => ({
        layouts: [noErrorLayout],
        routes: [route("/throw-no-error", { GET: throwHandler })],
      })),
      group(({ route }) => ({
        layouts: [nestedErrorLayout],
        middleware: [nestedMw],
        error: nestedError,
        routes: [route("/nested-error", { GET: throwHandler })],
      })),
      group(({ route }) => ({
        layouts: [throwingLayout],
        error: nestedError,
        routes: [route("/nested-layout-throws", { GET: okPage })],
      })),
      group(({ route }) => ({
        layouts: [throwingLayout],
        routes: [route("/nested-layout-throws-no-error", { GET: okPage })],
      })),
      group(({ route }) => ({
        error: throwingError,
        routes: [route("/nested-error-throws", { GET: throwHandler })],
      })),
      group(({ route }) => ({
        middleware: [throwingMw],
        routes: [route("/mw-throws", { GET: okPage })],
      })),
      group(({ route }) => ({
        error: jsonError,
        routes: [route("/json-throw", { GET: throwHandler })],
      })),
      group(({ route }) => ({
        routes: [route("/frag-throw", { GET: throwHandler })],
      })),
      group(({ route }) => ({
        error: compactError,
        routes: [route("/frag-error", { GET: throwHandler })],
      })),
      group(({ route }) => ({
        error: responseError,
        routes: [route("/frag-error-response", { GET: throwHandler })],
      })),
      group(({ route }) => ({
        error: throwingError,
        routes: [route("/frag-error-throws", { GET: throwHandler })],
      })),
      route("/embed-frag-throw", { GET: embedFragThrow }),
      route("/embed-frag-error", { GET: embedFragError }),
      route("/embed-frag-error-response", { GET: embedFragErrorResponse }),
      route("/embed-frag-error-throws", { GET: embedFragErrorThrows }),
      route("/embed-frag-miss", { GET: embedFragMiss }),
    ],
  }), { errorFallback, port: 0 });
}
