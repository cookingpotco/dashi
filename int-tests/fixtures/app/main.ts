import {
  type Ctx,
  group,
  type Middleware,
  route,
  serve,
  staticFile,
  StaticFileCacheStrategy,
} from "dashi";
import { cors } from "dashi/cors";
import type { AppState } from "./state.ts";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import nested from "./routes/nested/index.tsx";
import nestedLayout from "./routes/nested/_layout.tsx";
import echo from "./routes/echo.tsx";
import embed from "./routes/embed.tsx";
import fragment from "./routes/fragment.tsx";
import peer from "./routes/peer.tsx";
import postsNew from "./routes/posts_new.tsx";
import post from "./routes/post.tsx";
import {
  add as addGuestbook,
  list as listGuestbook,
} from "./routes/guestbook.tsx";
import ok from "./routes/ok.ts";
import gated from "./routes/gated.tsx";
import notFound from "./routes/not_found.tsx";
import rootError from "./routes/error.tsx";
import errorFallback from "./routes/error_fallback.tsx";
import {
  compactError,
  embedFragError,
  embedFragErrorResponse,
  embedFragErrorThrows,
  embedFragMiss,
  embedFragThrow,
  jsonError,
  nestedError,
  nestedErrorLayout,
  nestedMw,
  noErrorLayout,
  okPage,
  responseError,
  throwErrorHandlerBoom,
  throwHandler,
  throwingError,
  throwingLayout,
  throwingMw,
} from "./routes/errors.tsx";

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
  serve<AppState>({
    layouts: [root],
    middleware: [logger],
    notFound,
    error: rootError,
    errorFallback,
    routes: [
      route("/", { GET: home }),
      group({
        layouts: [nestedLayout],
        routes: [route("/nested", { GET: nested })],
      }),
      route("/echo", { GET: echo }),
      group({
        middleware: [embedOnly],
        routes: [route("/embed", { GET: embed })],
      }),
      group({
        middleware: [fragOnly],
        routes: [route("/fragment", { GET: fragment })],
      }),
      route("/peer", { GET: peer }),
      route("/posts/new", { GET: postsNew }),
      route("/posts/:id", { GET: post }),
      route("/guestbook", { GET: listGuestbook, POST: addGuestbook }),
      route("/ok", { GET: ok }),
      group({
        middleware: [cors()],
        routes: [route("/cors-star", { GET: ok })],
      }),
      group({
        middleware: [cors({
          origin: ["https://app.example", "https://other.example"],
        })],
        routes: [route("/cors-list", { GET: ok })],
      }),
      group({
        middleware: [cors({
          origin: (origin) =>
            origin === "https://app.example" ? origin : undefined,
        })],
        routes: [route("/cors-fn", { GET: ok })],
      }),
      route("/static/:path*", { GET: files }),
      route("/static-public/:path*", { GET: hour }),
      route("/static-private/:path*", { GET: priv }),
      route("/static-missing-dir/:path*", { GET: missingDir }),
      group({
        middleware: [requireSession],
        routes: [route("/gated", { GET: gated })],
      }),
      route("/throw", { GET: throwHandler }),
      route("/root-layout-throws", { GET: okPage }),
      route("/root-error-throws", { GET: throwErrorHandlerBoom }),
      group({
        layouts: [noErrorLayout],
        routes: [route("/throw-no-error", { GET: throwHandler })],
      }),
      group({
        layouts: [nestedErrorLayout],
        middleware: [nestedMw],
        error: nestedError,
        routes: [route("/nested-error", { GET: throwHandler })],
      }),
      group({
        layouts: [throwingLayout],
        error: nestedError,
        routes: [route("/nested-layout-throws", { GET: okPage })],
      }),
      group({
        layouts: [throwingLayout],
        routes: [route("/nested-layout-throws-no-error", { GET: okPage })],
      }),
      group({
        error: throwingError,
        routes: [route("/nested-error-throws", { GET: throwHandler })],
      }),
      group({
        middleware: [throwingMw],
        routes: [route("/mw-throws", { GET: okPage })],
      }),
      group({
        error: jsonError,
        routes: [route("/json-throw", { GET: throwHandler })],
      }),
      group({
        routes: [route("/frag-throw", { GET: throwHandler })],
      }),
      group({
        error: compactError,
        routes: [route("/frag-error", { GET: throwHandler })],
      }),
      group({
        error: responseError,
        routes: [route("/frag-error-response", { GET: throwHandler })],
      }),
      group({
        error: throwingError,
        routes: [route("/frag-error-throws", { GET: throwHandler })],
      }),
      route("/embed-frag-throw", { GET: embedFragThrow }),
      route("/embed-frag-error", { GET: embedFragError }),
      route("/embed-frag-error-response", { GET: embedFragErrorResponse }),
      route("/embed-frag-error-throws", { GET: embedFragErrorThrows }),
      route("/embed-frag-miss", { GET: embedFragMiss }),
    ],
  }, { port: 0 });
}
