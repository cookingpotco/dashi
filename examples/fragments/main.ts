import { type GroupCallback, type GroupFields, serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { errorFallback, ErrorPage } from "./errors.tsx";
import { fragment } from "./fragment/mod.tsx";
import { todos } from "./todos/mod.tsx";
import { todoCount } from "./todo_count/mod.tsx";
import { time } from "./time/mod.tsx";
import { notice } from "./notice/mod.tsx";

function app({ route }: GroupCallback): GroupFields {
  return {
    layouts: [RootLayout],
    middleware: [logger],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      fragment,
      todos,
      todoCount,
      time,
      notice,
    ],
  };
}

if (import.meta.main) {
  serve(app, { errorFallback });
}
