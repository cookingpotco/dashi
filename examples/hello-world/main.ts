import { type GroupCallback, type GroupFields, serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { errorFallback, ErrorPage, NotFound } from "./errors.tsx";
import { nested } from "./nested/mod.tsx";
import { secret } from "./secret/mod.tsx";
import { guestbook } from "./guestbook/mod.tsx";

function app({ route }: GroupCallback): GroupFields {
  return {
    layouts: [RootLayout],
    middleware: [logger],
    notFound: NotFound,
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      nested,
      secret,
      guestbook,
    ],
  };
}

if (import.meta.main) {
  serve(app, { errorFallback });
}
