import { route, serve } from "dashi";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import fragment from "./routes/fragment.tsx";
import ErrorPage, { errorFallback } from "./routes/error.tsx";

if (import.meta.main) {
  serve({
    layouts: [root],
    middleware: [logger],
    error: ErrorPage,
    errorFallback,
    routes: [
      route("/", { GET: home }),
      route("/fragment", { GET: fragment }),
    ],
  });
}
