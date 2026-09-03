import { CacheStrategy, serve, staticFile } from "dashi";
import { api } from "./api/mod.ts";
import { error, fatal, notFound } from "./errors.tsx";
import { Home } from "./home/mod.tsx";
import { Login } from "./login/mod.tsx";
import { logger } from "./logger_middleware.ts";
import { posts } from "./posts/mod.tsx";
import { RootLayout } from "./root_layout.tsx";
import { secret } from "./secret/mod.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/login", { GET: Login }),
      posts,
      secret,
      api,
      route("/assets/:path*", {
        GET: (ctx) =>
          staticFile(
            ctx,
            `${import.meta.dirname}/static`,
            ctx.params.path,
            { strategy: CacheStrategy.Immutable },
          ),
      }),
    ],
  }), { fatal });
}
