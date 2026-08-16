import { route, serve } from "dashi";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import nested from "./routes/nested/index.tsx";
import nestedLayout from "./routes/nested/_layout.tsx";
import secret from "./routes/secret.tsx";

if (import.meta.main) {
  serve({
    // TODO(COO-14): table shape — grouping, and whether wraps are inherited or listed on every leaf
    routes: [
      route("/", home, { layouts: [root], middleware: [logger] }),
      route("/nested", nested, {
        layouts: [root, nestedLayout],
        middleware: [logger],
      }),
      route("/secret", secret, { layouts: [root], middleware: [logger] }),
    ],
  });
}
