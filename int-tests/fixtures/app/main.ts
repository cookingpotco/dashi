import { group, type Middleware, route, serve } from "dashi";
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

if (import.meta.main) {
  serve<AppState>({
    layouts: [root],
    middleware: [logger],
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
        middleware: [requireSession],
        routes: [route("/gated", { GET: gated })],
      }),
    ],
  }, { port: 0 });
}
