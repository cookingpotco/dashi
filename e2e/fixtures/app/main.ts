import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { MarkPage } from "./mark_route.tsx";
import { Embed } from "./embed_route.tsx";
import { EagerFrag } from "./eager_route.tsx";
import { NestedFrag } from "./nested_route.tsx";
import { LazyFrag } from "./lazy_route.tsx";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    routes: [
      route("/", { GET: Home }),
      route("/mark", { GET: MarkPage }),
      route("/embed", { GET: Embed }),
      route("/eager", { GET: EagerFrag }),
      route("/nested", { GET: NestedFrag }),
      route("/lazy", { GET: LazyFrag }),
    ],
  }), { port: 0 });
}
