import { CacheStrategy, type ReadArgs, serve, staticFile } from "dashi";
import type { AppState } from "./state.ts";
import { Home } from "./home.tsx";
import { RootLayout } from "./root_layout.tsx";
import { root } from "./root_middleware.ts";
import { Echo } from "./echo.tsx";
import { post as postPatches, postUnprocessable } from "./patches.tsx";
import { postHtml } from "./write_html.ts";
import { NestEmbed } from "./nest_embed.tsx";
import { NestInner } from "./nest_inner.tsx";
import { NestMid } from "./nest_mid.tsx";
import { NestOuter } from "./nest_outer.tsx";
import { LazyNest } from "./lazy_nest.tsx";
import { LazyNestEmbed } from "./lazy_nest_embed.tsx";
import { DupSrc } from "./dup_src.tsx";
import { DistinctQuery } from "./distinct_query.tsx";
import { QueryFrag } from "./query_frag.tsx";
import { ProbePage } from "./probe.tsx";
import { Peer } from "./peer.tsx";
import { PostsNew } from "./posts_new.tsx";
import { Post } from "./post.tsx";
import { add as addGuestbook, list as listGuestbook } from "./guestbook.tsx";
import { ok } from "./ok/mod.ts";
import { statusNotFound } from "./status_not_found.tsx";
import { statusUnauthorized } from "./status_unauthorized.tsx";
import { statusCached } from "./status_cached.tsx";
import { statusOk } from "./status_ok.tsx";
import { statusResponse } from "./status_response.ts";
import { statusForbidden } from "./status_forbidden.tsx";
import { CachePublic } from "./cache_public.tsx";
import { CachePrivate } from "./cache_private.tsx";
import { CacheEmbed } from "./cache_embed.tsx";
import { CachePublicCookie } from "./cache_public_cookie.tsx";
import { CachePublicStar } from "./cache_public_star.tsx";
import { CachePrivateCookie } from "./cache_private_cookie.tsx";
import { cacheWrap } from "./cache_wrap/mod.tsx";
import { cacheCookieWrap } from "./cache_cookie_wrap/mod.tsx";
import { cacheOverrideWrap } from "./cache_override_wrap/mod.tsx";
import { cacheBoundary } from "./cache_boundary/mod.tsx";
import { cacheSession } from "./cache_session/mod.ts";
import { cachePublicThenThrow } from "./cache_public_then_throw/mod.ts";
import { nested } from "./nested/mod.tsx";
import { embed } from "./embed/mod.tsx";
import { fragment } from "./fragment/mod.tsx";
import { api } from "./api/mod.ts";
import { corsStar } from "./cors_star/mod.ts";
import { corsList } from "./cors_list/mod.ts";
import { corsFn } from "./cors_fn/mod.ts";
import { gated } from "./gated/mod.tsx";
import { throwNoError } from "./throw_no_error/mod.ts";
import { nestedError } from "./nested_error/mod.ts";
import { nestedLayoutThrows } from "./nested_layout_throws/mod.ts";
import { nestedLayoutThrowsNoError } from "./nested_layout_throws_no_error/mod.ts";
import { nestedErrorThrows } from "./nested_error_throws/mod.ts";
import { mwThrows } from "./mw_throws/mod.ts";
import { jsonThrow } from "./json_throw/mod.ts";
import { fragThrow } from "./frag_throw/mod.ts";
import { fragError } from "./frag_error/mod.ts";
import { fragErrorResponse } from "./frag_error_response/mod.ts";
import { fragErrorThrows } from "./frag_error_throws/mod.ts";
import { messageError } from "./message_error/mod.ts";
import { slow } from "./slow/mod.ts";
import {
  embedFragError,
  embedFragErrorResponse,
  embedFragErrorThrows,
  embedFragMiss,
  embedFragThrow,
  EmbedSlow,
  EmbedSlowEmpty,
  EmbedSlowHeld,
  fatal,
  NotFound,
  okPage,
  RootError,
  Slow,
  throwErrorHandlerBoom,
  throwHandler,
  throwServiceUnavailable,
} from "./errors.tsx";

const staticDir = `${import.meta.dirname}/static`;
const files = ({ ctx }: ReadArgs<AppState, { path: string }>) =>
  staticFile(ctx, staticDir, ctx.params.path);
const hour = ({ ctx }: ReadArgs<AppState, { path: string }>) =>
  staticFile(ctx, staticDir, ctx.params.path, {
    strategy: CacheStrategy.Public,
    maxAge: 3600,
    sMaxAge: 86400,
    staleWhileRevalidate: 120,
    varyHeaders: ["Accept-Language"],
  });
const priv = ({ ctx }: ReadArgs<AppState, { path: string }>) =>
  staticFile(ctx, staticDir, ctx.params.path, {
    strategy: CacheStrategy.Private,
    maxAge: 60,
  });
const immutableCookie = ({ ctx }: ReadArgs<AppState, { path: string }>) =>
  staticFile(ctx, staticDir, ctx.params.path, {
    strategy: CacheStrategy.Immutable,
    varyHeaders: ["Cookie"],
  });
const missingDir = ({ ctx }: ReadArgs<AppState, { path: string }>) =>
  staticFile(
    ctx,
    `${import.meta.dirname}/no-such-static`,
    ctx.params.path,
  );

export function start() {
  return serve<AppState>(({ route }) => ({
    layouts: [RootLayout],
    middleware: [root],
    notFound: NotFound,
    error: RootError,
    routes: [
      route("/", { GET: Home }),
      route("/probe", { GET: ProbePage }),
      route("/cache-public", { GET: CachePublic }),
      route("/cache-public-cookie", { GET: CachePublicCookie }),
      route("/cache-public-star", { GET: CachePublicStar }),
      route("/cache-private", { GET: CachePrivate }),
      route("/cache-private-cookie", { GET: CachePrivateCookie }),
      route("/cache-embed", { GET: CacheEmbed }),
      cacheWrap,
      cacheCookieWrap,
      cacheOverrideWrap,
      cacheBoundary,
      cacheSession,
      cachePublicThenThrow,
      nested,
      route("/echo", { GET: Echo }),
      embed,
      route("/nested-embed", { GET: NestEmbed }),
      route("/nest-outer", { GET: NestOuter }),
      route("/nest-mid", { GET: NestMid }),
      route("/nest-inner", { GET: NestInner }),
      route("/lazy-nest", { GET: LazyNest }),
      route("/lazy-nest-embed", { GET: LazyNestEmbed }),
      route("/dup-src", { GET: DupSrc }),
      route("/distinct-query", { GET: DistinctQuery }),
      route("/query-frag", { GET: QueryFrag }),
      fragment,
      route("/peer", { GET: Peer }),
      route("/patches", { POST: postPatches }),
      route("/patches-unprocessable", { POST: postUnprocessable }),
      route("/write-html", { POST: postHtml }),
      route("/posts/new", { GET: PostsNew }),
      route("/posts/:id", { GET: Post }),
      route("/guestbook", { GET: listGuestbook, POST: addGuestbook }),
      route("/ok", { GET: ok }),
      route("/status-not-found", { GET: statusNotFound }),
      route("/status-unauthorized", { GET: statusUnauthorized }),
      route("/status-cached", { GET: statusCached }),
      route("/status-ok", { GET: statusOk }),
      route("/status-response", { GET: statusResponse }),
      route("/status-forbidden", { GET: statusForbidden }),
      api,
      corsStar,
      corsList,
      corsFn,
      route("/static/:path*", { GET: files }),
      route("/static-public/:path*", { GET: hour }),
      route("/static-private/:path*", { GET: priv }),
      route("/static-immutable-cookie/:path*", { GET: immutableCookie }),
      route("/static-missing-dir/:path*", { GET: missingDir }),
      gated,
      route("/throw", { GET: throwHandler }),
      route("/throw-503", { GET: throwServiceUnavailable }),
      route("/root-layout-throws", { GET: okPage }),
      route("/root-error-throws", { GET: throwErrorHandlerBoom }),
      throwNoError,
      nestedError,
      nestedLayoutThrows,
      nestedLayoutThrowsNoError,
      nestedErrorThrows,
      mwThrows,
      jsonThrow,
      fragThrow,
      fragError,
      fragErrorResponse,
      fragErrorThrows,
      route("/embed-frag-throw", { GET: embedFragThrow }),
      route("/embed-frag-error", { GET: embedFragError }),
      route("/embed-frag-error-response", { GET: embedFragErrorResponse }),
      route("/embed-frag-error-throws", { GET: embedFragErrorThrows }),
      route("/embed-frag-miss", { GET: embedFragMiss }),
      messageError,
      slow,
      route("/slow-no-error", { GET: Slow }),
      route("/embed-slow", { GET: EmbedSlow }),
      route("/embed-slow-empty", { GET: EmbedSlowEmpty }),
      route("/embed-slow-held", { GET: EmbedSlowHeld }),
    ],
  }), { fatal, hostname: "127.0.0.1", port: 0 });
}
