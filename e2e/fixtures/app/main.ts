import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { MarkPage } from "./mark_route.tsx";
import { PaintPage } from "./paint_route.tsx";
import { Embed } from "./embed_route.tsx";
import { EagerFrag } from "./eager_route.tsx";
import { NestedFrag } from "./nested_route.tsx";
import { LazyFrag } from "./lazy_route.tsx";
import { Fail } from "./fail_route.tsx";
import { FailFrag } from "./fail_frag_route.tsx";
import { Empty } from "./empty_route.tsx";
import { emptyFail } from "./empty_fail_route.ts";
import { Slow } from "./slow_route.tsx";
import { Count } from "./count_route.tsx";
import { Counted } from "./counted_route.tsx";
import { countedHits } from "./counted_hits_route.ts";
import { create as createTodo, list as listTodos } from "./todos_route.tsx";
import { TodosPage } from "./todos_page_route.tsx";
import { ActionsPage } from "./actions_page_route.tsx";
import {
  apply as applyActions,
  form as actionsForm,
} from "./actions_route.tsx";
import { list as listTodoCount } from "./todo_count_route.tsx";
import {
  dismiss as dismissNotice,
  list as listNotice,
} from "./notice_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { errorFallback, ErrorPage } from "./errors.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      route("/mark", { GET: MarkPage }),
      route("/paint", { GET: PaintPage }),
      route("/embed", { GET: Embed }),
      route("/eager", { GET: EagerFrag }),
      route("/nested", { GET: NestedFrag }),
      route("/lazy", { GET: LazyFrag }),
      route("/fail", { GET: Fail }),
      route("/fail-frag", { GET: FailFrag }),
      route("/empty", { GET: Empty }),
      route("/empty-fail", { GET: emptyFail }),
      route("/slow", { GET: Slow }),
      route("/count", { GET: Count }),
      route("/counted", { GET: Counted }),
      route("/counted-hits", { GET: countedHits }),
      route("/todos-page", { GET: TodosPage }),
      route("/todos", { GET: listTodos, POST: createTodo }),
      route("/actions-page", { GET: ActionsPage }),
      route("/actions", { GET: actionsForm, POST: applyActions }),
      route("/todo-count", { GET: listTodoCount }),
      route("/notice", { GET: listNotice, POST: dismissNotice }),
    ],
  }), { errorFallback, port: 0 });
}
