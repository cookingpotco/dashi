import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { errorFallback, ErrorPage } from "./errors.tsx";
import { mark } from "./mark/mod.tsx";
import { paint } from "./paint/mod.tsx";
import { embed } from "./embed/mod.tsx";
import { eager } from "./eager/mod.tsx";
import { nested } from "./nested/mod.tsx";
import { lazy } from "./lazy/mod.tsx";
import { fail } from "./fail/mod.tsx";
import { failFrag } from "./fail_frag/mod.tsx";
import { empty } from "./empty/mod.tsx";
import { emptyFail } from "./empty_fail/mod.ts";
import { slow } from "./slow/mod.tsx";
import { count } from "./count/mod.tsx";
import { counted } from "./counted/mod.tsx";
import { countedHits } from "./counted_hits/mod.ts";
import { todosPage } from "./todos_page/mod.tsx";
import { todos } from "./todos/mod.tsx";
import { actionsPage } from "./actions_page/mod.tsx";
import { actions } from "./actions/mod.tsx";
import { todoCount } from "./todo_count/mod.tsx";
import { hits } from "./hits/mod.tsx";
import { notice } from "./notice/mod.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      mark,
      paint,
      embed,
      eager,
      nested,
      lazy,
      fail,
      failFrag,
      empty,
      emptyFail,
      slow,
      count,
      counted,
      countedHits,
      todosPage,
      todos,
      actionsPage,
      actions,
      todoCount,
      hits,
      notice,
    ],
  }), { errorFallback, port: 0 });
}
