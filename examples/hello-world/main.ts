import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { Nested } from "./nested_route.tsx";
import { NestedLayout } from "./nested_layout.tsx";
import { Secret } from "./secret_route.tsx";
import {
  add as addGuestbook,
  list as listGuestbook,
} from "./guestbook_route.tsx";
import { errorFallback, ErrorPage, NotFound } from "./errors.tsx";

if (import.meta.main) {
  serve(({ route, group }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    notFound: NotFound,
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      group(({ route }) => ({
        layouts: [NestedLayout],
        routes: [route("/nested", { GET: Nested })],
      })),
      route("/secret", { GET: Secret }),
      route("/guestbook", { GET: listGuestbook, POST: addGuestbook }),
    ],
  }), { errorFallback });
}
