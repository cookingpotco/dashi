import { serve } from "dashi";
import { Home } from "./home.tsx";
import { RootLayout } from "./root_layout.tsx";
import { ErrorPage, fatal } from "./errors.tsx";
import { MarkPage } from "./mark/mod.tsx";
import { PaintPage } from "./paint/mod.tsx";
import { Embed } from "./embed.tsx";
import { StampedSlot } from "./stamped/mod.tsx";
import { NestedSlot } from "./nested/mod.tsx";
import { LazySlot } from "./lazy/mod.tsx";
import { Fail } from "./fail.tsx";
import { FailSlot } from "./fail_slot.tsx";
import { Empty } from "./empty.tsx";
import { emptyFailHandler } from "./empty_fail.ts";
import { Slow } from "./slow.tsx";
import { Count } from "./count.tsx";
import { Counted } from "./counted.tsx";
import { countedHitsHandler } from "./counted_hits.ts";
import { VisibleBelow } from "./visible_below.tsx";
import { VisibleCounted, visibleHitsHandler } from "./visible_counted.tsx";
import { LazyBelow } from "./lazy_below.tsx";
import { BelowCounted, belowHitsHandler } from "./below_counted.tsx";
import { TodosPage } from "./todos_page.tsx";
import { create as createTodo, list as listTodos } from "./todos/mod.tsx";
import { PatchesPage } from "./patches_page.tsx";
import { apply as applyPatches, form as patchesForm } from "./patches.tsx";
import { list as todoCount } from "./todo_count.tsx";
import { list as hits } from "./hits.tsx";
import { dismiss as dismissNotice, list as notice } from "./notice.tsx";
import { list as slot } from "./slot.tsx";
import { slotJsonHandler } from "./slot_json.ts";
import { slotRedirectAwayHandler } from "./slot_redirect_away.ts";
import { TrustSlots } from "./trust_slots.tsx";
import { apply as applyInserts, form as insertsForm } from "./inserts.tsx";
import {
  apply as applyElementReplace,
  applyVoidUpdate,
  form as elementReplaceForm,
  voidForm,
} from "./element_replace.tsx";

export function start() {
  return serve(({ route }) => ({
    layouts: [RootLayout],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      route("/mark", { GET: MarkPage }),
      route("/paint", { GET: PaintPage }),
      route("/embed", { GET: Embed }),
      route("/stamped", { GET: StampedSlot }),
      route("/nested", { GET: NestedSlot }),
      route("/lazy", { GET: LazySlot }),
      route("/fail", { GET: Fail }),
      route("/fail-slot", { GET: FailSlot }),
      route("/empty", { GET: Empty }),
      route("/empty-fail", { GET: emptyFailHandler }),
      route("/slow", { GET: Slow }),
      route("/count", { GET: Count }),
      route("/counted", { GET: Counted }),
      route("/counted-hits", { GET: countedHitsHandler }),
      route("/visible-below", { GET: VisibleBelow }),
      route("/visible-counted", { GET: VisibleCounted }),
      route("/visible-hits", { GET: visibleHitsHandler }),
      route("/lazy-below", { GET: LazyBelow }),
      route("/below-counted", { GET: BelowCounted }),
      route("/below-hits", { GET: belowHitsHandler }),
      route("/todos-page", { GET: TodosPage }),
      route("/todos", { GET: listTodos, POST: createTodo }),
      route("/patches-page", { GET: PatchesPage }),
      route("/patches", { GET: patchesForm, POST: applyPatches }),
      route("/todo-count", { GET: todoCount }),
      route("/hits", { GET: hits }),
      route("/notice", { GET: notice, POST: dismissNotice }),
      route("/slot", { GET: slot }),
      route("/slot-json", { GET: slotJsonHandler }),
      route("/slot-redirect-away", { GET: slotRedirectAwayHandler }),
      route("/trust-slots", { GET: TrustSlots }),
      route("/inserts", { GET: insertsForm, POST: applyInserts }),
      route("/element-replace", {
        GET: elementReplaceForm,
        POST: applyElementReplace,
      }),
      route("/void-update", { GET: voidForm, POST: applyVoidUpdate }),
    ],
  }), { fatal, hostname: "127.0.0.1", port: 0 });
}
