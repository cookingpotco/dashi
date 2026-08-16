import { route, serve } from "dashi";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import fragment from "./routes/fragment.tsx";

if (import.meta.main) {
  serve({
    // TODO(COO-14): table shape — grouping, and whether wraps are inherited or listed on every leaf
    routes: [
      route("/", home, { layouts: [root], middleware: [logger] }),
      route("/fragment", fragment, { layouts: [root], middleware: [logger] }),
    ],
  });
}
