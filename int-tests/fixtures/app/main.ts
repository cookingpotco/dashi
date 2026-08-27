import {
  CacheStrategy,
  type Ctx,
  type Middleware,
  serve,
  staticFile,
  type WriteHandler,
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
import { post as postActions } from "./actions_route.tsx";
import { postHtml } from "./write_html_route.ts";
import { postJsx } from "./write_jsx_route.tsx";
import { Embed } from "./embed_route.tsx";
import { Fragment, post as postFragment } from "./fragment_route.tsx";
import { NestEmbed } from "./nest_embed_route.tsx";
import { NestInner } from "./nest_inner_route.tsx";
import { NestMid } from "./nest_mid_route.tsx";
import { NestOuter } from "./nest_outer_route.tsx";
import { LazyNest } from "./lazy_nest_route.tsx";
import { LazyNestEmbed } from "./lazy_nest_embed_route.tsx";
import { DupSrc } from "./dup_src_route.tsx";
import { ProbePage } from "./probe_route.tsx";
import { Peer } from "./peer_route.tsx";
import { PostsNew } from "./posts_new_route.tsx";
import { Post } from "./post_route.tsx";
import {
  add as addGuestbook,
  list as listGuestbook,
} from "./guestbook_route.tsx";
import { ok } from "./ok_route.ts";
import { Gated } from "./gated_route.tsx";
import { CachePublic } from "./cache_public_route.tsx";
import { CacheEmbed } from "./cache_embed_route.tsx";
import { CachePublicLayout } from "./cache_public_layout.tsx";
import { CacheFromLayout } from "./cache_from_layout_route.tsx";
import { CachePrivateLayout } from "./cache_private_layout.tsx";
import { CacheOverride } from "./cache_override_route.tsx";
import { CacheSession } from "./cache_session_route.tsx";
import { CacheCors } from "./cache_cors_route.tsx";
import {
  ApiNotFound,
  ApiV2NotFound,
  compactError,
  CycleA,
  CycleB,
  Depth1,
  Depth2,
  Depth3,
  Depth4,
  Depth5,
  Depth6,
  DepthEmbed,
  EmbedCycle,
  embedFragError,
  embedFragErrorResponse,
  embedFragErrorThrows,
  embedFragMiss,
  embedFragThrow,
  EmbedSlow,
  EmbedSlowEmpty,
  errorFallback,
  jsonError,
  messageError,
  nestedError,
  nestedErrorLayout,
  nestedMw,
  noErrorLayout,
  NotFound,
  okPage,
  responseError,
  RootError,
  SelfInclude,
  Slow,
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

const takeToken: Middleware<AppState> = (ctx, next) => {
  if (ctx.req.headers.get("cookie")?.includes("token=")) {
    ctx.state.token = "1";
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
    strategy: CacheStrategy.Public,
    maxAge: 3600,
    sMaxAge: 86400,
    staleWhileRevalidate: 120,
  });
const priv = (ctx: Ctx<{ path: string }, AppState>) =>
  staticFile(ctx, staticDir, ctx.params.path, {
    strategy: CacheStrategy.Private,
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
      route("/probe", { GET: ProbePage }),
      route("/cache-public", { GET: CachePublic }),
      route("/cache-embed", { GET: CacheEmbed }),
      group(({ route }) => ({
        layouts: [CachePublicLayout],
        routes: [route("/cache-from-layout", { GET: CacheFromLayout })],
      })),
      group(({ route }) => ({
        layouts: [CachePrivateLayout],
        routes: [route("/cache-override", { GET: CacheOverride })],
      })),
      group(({ route }) => ({
        middleware: [takeToken],
        routes: [route("/cache-session", { GET: CacheSession })],
      })),
      group(({ route }) => ({
        layouts: [throwingLayout],
        routes: [route("/cache-public-then-throw", { GET: CachePublic })],
      })),
      group(({ route }) => ({
        layouts: [NestedLayout],
        routes: [route("/nested", { GET: Nested })],
      })),
      route("/echo", { GET: Echo }),
      group(({ route }) => ({
        middleware: [embedOnly],
        routes: [route("/embed", { GET: Embed })],
      })),
      route("/nested-embed", { GET: NestEmbed }),
      route("/nest-outer", { GET: NestOuter }),
      route("/nest-mid", { GET: NestMid }),
      route("/nest-inner", { GET: NestInner }),
      route("/lazy-nest", { GET: LazyNest }),
      route("/lazy-nest-embed", { GET: LazyNestEmbed }),
      route("/dup-src", { GET: DupSrc }),
      group(({ route }) => ({
        middleware: [fragOnly],
        routes: [route("/fragment", { GET: Fragment, POST: postFragment })],
      })),
      route("/peer", { GET: Peer }),
      route("/actions", { POST: postActions }),
      route("/write-html", { POST: postHtml }),
      route("/write-jsx", {
        // The table type cannot express an invalid Element return; the
        // pipeline still rejects it at runtime.
        POST: postJsx as unknown as WriteHandler<
          Record<string, never>,
          AppState
        >,
      }),
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
        routes: [
          route("/cors-list", { GET: ok }),
          route("/cache-cors", { GET: CacheCors }),
        ],
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
      group(({ route }) => ({
        error: messageError,
        routes: [
          route("/self-include", { GET: SelfInclude }),
          route("/cycle-a", { GET: CycleA }),
          route("/cycle-b", { GET: CycleB }),
          route("/embed-cycle", { GET: EmbedCycle }),
          route("/depth-embed", { GET: DepthEmbed }),
          route("/d1", { GET: Depth1 }),
          route("/d2", { GET: Depth2 }),
          route("/d3", { GET: Depth3 }),
          route("/d4", { GET: Depth4 }),
          route("/d5", { GET: Depth5 }),
          route("/d6", { GET: Depth6 }),
        ],
      })),
      group(({ route }) => ({
        error: compactError,
        routes: [
          route("/slow", { GET: Slow }),
        ],
      })),
      route("/slow-no-error", { GET: Slow }),
      route("/embed-slow", { GET: EmbedSlow }),
      route("/embed-slow-empty", { GET: EmbedSlowEmpty }),
    ],
  }), { errorFallback, port: 0 });
}
