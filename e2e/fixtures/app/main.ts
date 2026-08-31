import { serve } from "dashi";
import { Home } from "./home.tsx";
import { RootLayout } from "./root_layout.tsx";
import { ErrorPage, fatal } from "./errors.tsx";
import { MarkPage } from "./mark/mod.tsx";
import { PaintPage } from "./paint/mod.tsx";
import { Embed } from "./embed.tsx";
import { EagerFrag } from "./eager/mod.tsx";
import { NestedFrag } from "./nested/mod.tsx";
import { LazyFrag } from "./lazy/mod.tsx";
import { Fail } from "./fail.tsx";
import { FailFrag } from "./fail_frag.tsx";
import { Empty } from "./empty.tsx";
import { emptyFailHandler } from "./empty_fail.ts";
import { Slow } from "./slow.tsx";
import { Count } from "./count.tsx";
import { Counted } from "./counted.tsx";
import { countedHitsHandler } from "./counted_hits.ts";
import { TodosPage } from "./todos_page.tsx";
import { create as createTodo, list as listTodos } from "./todos/mod.tsx";
import { PatchesPage } from "./patches_page.tsx";
import { apply as applyPatches, form as patchesForm } from "./patches.tsx";
import { list as todoCount } from "./todo_count.tsx";
import { list as hits } from "./hits.tsx";
import { dismiss as dismissNotice, list as notice } from "./notice.tsx";
import { list as slot } from "./slot.tsx";
import { apply as applyInserts, form as insertsForm } from "./inserts.tsx";

export function start() {
  return serve(({ route }) => ({
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
      route("/empty-fail", { GET: emptyFailHandler }),
      route("/slow", { GET: Slow }),
      route("/count", { GET: Count }),
      route("/counted", { GET: Counted }),
      route("/counted-hits", { GET: countedHitsHandler }),
      route("/todos-page", { GET: TodosPage }),
      route("/todos", { GET: listTodos, POST: createTodo }),
      route("/patches-page", { GET: PatchesPage }),
      route("/patches", { GET: patchesForm, POST: applyPatches }),
      route("/todo-count", { GET: todoCount }),
      route("/hits", { GET: hits }),
      route("/notice", { GET: notice, POST: dismissNotice }),
      route("/slot", { GET: slot }),
      route("/inserts", { GET: insertsForm, POST: applyInserts }),
    ],
  }), { fatal, hostname: "127.0.0.1", port: 0 });
}
