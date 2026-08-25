import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { logger } from "./logger_middleware.ts";
import { Fragment } from "./fragment_route.tsx";
import { create, list } from "./todos_route.tsx";
import { list as listTodoCount } from "./todo_count_route.tsx";
import {
  dismiss as dismissNotice,
  list as listNotice,
} from "./notice_route.tsx";
import { errorFallback, ErrorPage } from "./errors.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      route("/fragment", { GET: Fragment }),
      route("/todos", { GET: list, POST: create }),
      route("/todo-count", { GET: listTodoCount }),
      route("/notice", { GET: listNotice, POST: dismissNotice }),
    ],
  }), { errorFallback });
}
