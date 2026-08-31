import { group } from "dashi";
import { RootLayout } from "../root_layout.tsx";
import { ErrorPage } from "../errors.tsx";
import { list as listEntries, write } from "../entries.tsx";
import { list as listEntriesForm } from "../entries_form/mod.tsx";
import { Search } from "../search.tsx";
import { post as postSlow, SlowWrite } from "../slow_write.tsx";
import { Wrote } from "../wrote.tsx";
import { writesHandler } from "../writes/mod.ts";
import { jsonWriteHandler } from "../json_write.ts";
import { dropWriteHandler } from "../drop_write.ts";
import { FragPage } from "../frag_page/mod.tsx";
import { list as listFrag, update as updateFrag } from "../frag.tsx";
import { leave, list as listFragLeave } from "../frag_leave.tsx";

export const chrome = group(({ route }) => ({
  layouts: [RootLayout],
  error: ErrorPage,
  routes: [
    route("/entries", { GET: listEntries, POST: write }),
    route("/entries-form", { GET: listEntriesForm }),
    route("/search", { GET: Search }),
    route("/slow-write", { GET: SlowWrite, POST: postSlow }),
    route("/wrote", { GET: Wrote }),
    route("/writes", { GET: writesHandler }),
    route("/json-write", { GET: jsonWriteHandler, POST: jsonWriteHandler }),
    route("/drop-write", { GET: dropWriteHandler, POST: dropWriteHandler }),
    route("/frag-page", { GET: FragPage }),
    route("/frag", { GET: listFrag, POST: updateFrag }),
    route("/frag-leave", { GET: listFragLeave, POST: leave }),
  ],
}));
