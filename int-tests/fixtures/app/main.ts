import { route, serve } from "dashi";
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
    // TODO(COO-14): table shape — grouping, and whether wraps are inherited or listed on every leaf
    routes: [
      route("/", home, { layouts: [root], middleware: [logger] }),
      route("/nested", nested, {
        layouts: [root, nestedLayout],
        middleware: [logger],
      }),
      route("/echo", echo, { layouts: [root], middleware: [logger] }),
      route("/embed", embed, { layouts: [root], middleware: [logger] }),
      route("/fragment", fragment, { layouts: [root], middleware: [logger] }),
      route("/posts/new", postsNew, { layouts: [root], middleware: [logger] }),
      route("/posts/:id", post, { layouts: [root], middleware: [logger] }),
    ],
  });
}
