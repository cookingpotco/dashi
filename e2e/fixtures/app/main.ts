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
    ],
  }), { errorFallback, port: 0 });
}
