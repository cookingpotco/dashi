import { serve } from "dashi";
import { list, write } from "./entries_route.tsx";
import { Search } from "./search_route.tsx";
import { SlowWrite, slowWrite } from "./slow_write_route.tsx";
import { writes } from "./writes_route.ts";
import { jsonWrite } from "./json_write_route.ts";
import { FragPage } from "./frag_page_route.tsx";
import { list as listFrag, update as updateFrag } from "./frag_route.tsx";
import {
  leave as leaveFrag,
  list as listFragLeave,
} from "./frag_leave_route.tsx";
import { Bare, post as postBare } from "./bare_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { BareLayout } from "./bare_layout.tsx";
import { errorFallback, ErrorPage } from "./errors.tsx";

if (import.meta.main) {
  serve(({ group }) => ({
    routes: [
      group(({ route }) => ({
        layouts: [RootLayout],
        error: ErrorPage,
        routes: [
          route("/entries", { GET: list, POST: write }),
          route("/search", { GET: Search }),
          route("/slow-write", { GET: SlowWrite, POST: slowWrite }),
          route("/writes", { GET: writes }),
          route("/json-write", { GET: jsonWrite, POST: jsonWrite }),
          route("/frag-page", { GET: FragPage }),
          route("/frag", { GET: listFrag, POST: updateFrag }),
          route("/frag-leave", { GET: listFragLeave, POST: leaveFrag }),
        ],
      })),
      group(({ route }) => ({
        layouts: [BareLayout],
        routes: [
          route("/bare-frag-page", { GET: FragPage }),
          route("/bare", { GET: Bare, POST: postBare }),
        ],
      })),
    ],
  }), { errorFallback, port: 0 });
}
