import { serve } from "dashi";
import { Home } from "./home.tsx";
import { RootLayout } from "./root_layout.tsx";
import { ErrorPage, fatal } from "./errors.tsx";
import { MarkPage } from "./mark/mod.tsx";
import { PaintPage } from "./paint/mod.tsx";
import { Embed } from "./embed.tsx";
import { StampedFrag } from "./stamped/mod.tsx";
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
import { apply as applyInserts, form as insertsForm } from "./inserts.tsx";
import {
  apply as applyElementReplace,
  applyVoidUpdate,
  form as elementReplaceForm,
  voidForm,
} from "./element_replace.tsx";
import { CycleA } from "./cycle_a.tsx";
import { CycleB } from "./cycle_b.tsx";
import { EmbedCycle } from "./embed_cycle.tsx";
import { SelfInclude } from "./self_include.tsx";
import { EmbedSelfInclude } from "./embed_self_include.tsx";
import { cycleHitsHandler, resetCycleHitsHandler } from "./cycle_hits.ts";
import { DepthEmbed } from "./depth_embed.tsx";
import { Depth1 } from "./depth_1.tsx";
import { Depth2 } from "./depth_2.tsx";
import { Depth3 } from "./depth_3.tsx";
import { Depth4 } from "./depth_4.tsx";
import { Depth5 } from "./depth_5.tsx";
import { Depth6 } from "./depth_6.tsx";
import { depthHitsHandler, resetDepthHitsHandler } from "./depth_hits.ts";

export function start() {
  return serve(({ route }) => ({
    layouts: [RootLayout],
    error: ErrorPage,
    routes: [
      route("/", { GET: Home }),
      route("/mark", { GET: MarkPage }),
      route("/paint", { GET: PaintPage }),
      route("/embed", { GET: Embed }),
      route("/stamped", { GET: StampedFrag }),
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
      route("/inserts", { GET: insertsForm, POST: applyInserts }),
      route("/element-replace", {
        GET: elementReplaceForm,
        POST: applyElementReplace,
      }),
      route("/void-update", { GET: voidForm, POST: applyVoidUpdate }),
      route("/embed-cycle", { GET: EmbedCycle }),
      route("/cycle-a", { GET: CycleA }),
      route("/cycle-b", { GET: CycleB }),
      route("/cycle-hits", { GET: cycleHitsHandler }),
      route("/cycle-hits-reset", { GET: resetCycleHitsHandler }),
      route("/embed-self-include", { GET: EmbedSelfInclude }),
      route("/self-include", { GET: SelfInclude }),
      route("/depth-embed", { GET: DepthEmbed }),
      route("/d1", { GET: Depth1 }),
      route("/d2", { GET: Depth2 }),
      route("/d3", { GET: Depth3 }),
      route("/d4", { GET: Depth4 }),
      route("/d5", { GET: Depth5 }),
      route("/d6", { GET: Depth6 }),
      route("/depth-hits", { GET: depthHitsHandler }),
      route("/depth-hits-reset", { GET: resetDepthHitsHandler }),
    ],
  }), { fatal, hostname: "127.0.0.1", port: 0 });
}
