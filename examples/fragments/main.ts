import { route, serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { Fragment } from "./fragment_route.tsx";
import { errorFallback, ErrorPage } from "./errors.tsx";

if (import.meta.main) {
  serve({
    layouts: [RootLayout],
    middleware: [logger],
    error: ErrorPage,
    errorFallback,
    routes: [
      route("/", { GET: Home }),
      route("/fragment", { GET: Fragment }),
    ],
  });
}
