import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { ErrorPage, fatal } from "./errors.tsx";
import { fragment } from "./fragment/mod.tsx";
import { todos } from "./todos/mod.tsx";
import { time } from "./time/mod.tsx";
import { notice } from "./notice/mod.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      fragment,
      todos,
      time,
      notice,
    ],
  }), { fatal });
}
