import { group, route, serve } from "dashi";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import nested from "./routes/nested/index.tsx";
import nestedLayout from "./routes/nested/_layout.tsx";
import secret from "./routes/secret.tsx";

if (import.meta.main) {
  serve({
    layouts: [root],
    middleware: [logger],
    routes: [
      route("/", home),
      group({
        layouts: [nestedLayout],
        routes: [route("/nested", nested)],
      }),
      route("/secret", secret),
    ],
  });
}
