import { serve } from "dashi";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { ErrorPage, fatal } from "./errors.tsx";
import { Fragment } from "./fragment/mod.tsx";
import { todos } from "./todos/mod.tsx";
import { list as time } from "./time/mod.tsx";
import { dismiss, list as notice } from "./notice/mod.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      route("/fragment", { GET: Fragment }),
      todos,
      route("/time", { GET: time }),
      route("/notice", { GET: notice, POST: dismiss }),
    ],
  }), { fatal });
}
