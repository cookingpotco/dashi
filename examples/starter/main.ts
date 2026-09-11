import { CacheStrategy, serve, staticFile } from "dashi";
import { error, fatal, notFound } from "./errors.tsx";
import { Home } from "./home/mod.tsx";
import { logger } from "./logger_middleware.ts";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  const port = Deno.env.get("PORT");
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/generated/:file", {
        GET: ({ ctx }) =>
          staticFile(ctx, `${import.meta.dirname}/generated`, ctx.params.file, {
            strategy: CacheStrategy.Immutable,
          }),
      }),
      route("/static/:file", {
        GET: ({ ctx }) =>
          staticFile(ctx, `${import.meta.dirname}/static`, ctx.params.file, {
            strategy: CacheStrategy.Immutable,
          }),
      }),
    ],
  }), {
    fatal,
    ...(port === undefined ? {} : { port: Number(port) }),
  });
}
