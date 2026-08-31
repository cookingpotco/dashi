import { serve } from "dashi";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { ErrorPage, fatal, NotFound } from "./errors.tsx";
import { nested } from "./nested/mod.tsx";
import { Secret } from "./secret.tsx";
import { add, list } from "./guestbook.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    notFound: NotFound,
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      nested,
      route("/secret", { GET: Secret }),
      route("/guestbook", { GET: list, POST: add }),
    ],
  }), { fatal });
}
