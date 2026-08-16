import { group, route, serve } from "dashi";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import nested from "./routes/nested/index.tsx";
import nestedLayout from "./routes/nested/_layout.tsx";
import echo from "./routes/echo.tsx";
import embed from "./routes/embed.tsx";
import fragment from "./routes/fragment.tsx";
import postsNew from "./routes/posts_new.tsx";
import post from "./routes/post.tsx";

if (import.meta.main) {
  serve({
    port: 0,
    layouts: [root],
    middleware: [logger],
    routes: [
      route("/", home),
      group({
        layouts: [nestedLayout],
        routes: [route("/nested", nested)],
      }),
      route("/echo", echo),
      route("/embed", embed),
      route("/fragment", fragment),
      route("/posts/new", postsNew),
      route("/posts/:id", post),
    ],
  });
}
