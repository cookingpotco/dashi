import { CacheStrategy, serve, staticFile } from "dashi";
import { generatedFile } from "@cookingpot/dashi-css";
import { error, fatal, notFound } from "./errors.tsx";
import { Home } from "./home/mod.tsx";
import { logger } from "./logger_middleware.ts";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  if (import.meta.dirname === undefined) {
    throw new Error("import.meta.dirname is required");
  }
  const root = import.meta.dirname;
  const port = Deno.env.get("PORT");
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/generated/:file", { GET: generatedFile(root) }),
      route("/static/:file", {
        GET: ({ ctx }) =>
          staticFile(ctx, `${root}/static`, ctx.params.file, {
            strategy: CacheStrategy.Immutable,
          }),
      }),
    ],
  }), {
    fatal,
    ...(port === undefined ? {} : { port: Number(port) }),
  });
}
