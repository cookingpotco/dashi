import { buildCss } from "../../../css/mod.ts";
import { CacheStrategy, serve, staticFile } from "dashi";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";

export async function start() {
  if (import.meta.dirname === undefined) {
    throw new Error("import.meta.dirname is required");
  }
  const root = import.meta.dirname;
  await buildCss({ root });
  return serve(({ route }) => ({
    layouts: [RootLayout],
    routes: [
      route("/", { GET: Home }),
      route("/generated/:file", {
        GET: ({ ctx }) =>
          staticFile(ctx, `${root}/generated`, ctx.params.file, {
            strategy: CacheStrategy.Immutable,
          }),
      }),
    ],
  }), { hostname: "127.0.0.1", port: 0 });
}
