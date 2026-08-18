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

const embedOnly: Middleware<AppState> = (ctx, next) => {
  ctx.state.embedOnly = "yes";
  return next();
};

const fragOnly: Middleware<AppState> = (ctx, next) => {
  ctx.state.fragOnly = "yes";
  return next();
};

if (import.meta.main) {
  serve<AppState>({
    layouts: [root],
    middleware: [logger],
    routes: [
      route("/", home),
      group({
        layouts: [nestedLayout],
        routes: [route("/nested", nested)],
      }),
      route("/echo", echo),
      group({
        middleware: [embedOnly],
        routes: [route("/embed", embed)],
      }),
      group({
        middleware: [fragOnly],
        routes: [route("/fragment", fragment)],
      }),
      route("/peer", peer),
      route("/posts/new", postsNew),
      route("/posts/:id", post),
    ],
  }, { port: 0 });
}
