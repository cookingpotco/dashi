import { CacheStrategy, serve, staticFile } from "dashi";
import { error, fatal, notFound } from "./errors.tsx";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/static/:file", {
        GET: (ctx) =>
          staticFile(
            ctx,
            `${import.meta.dirname}/static`,
            ctx.params.file,
            { strategy: CacheStrategy.Immutable },
          ),
      }),
    ],
  }), { fatal });
}
