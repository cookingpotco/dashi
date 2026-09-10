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
import { SlotPage } from "../slot_page/mod.tsx";
import {
  list as listSlotHole,
  update as updateSlotHole,
} from "../slot_hole.tsx";
import { leave, list as listSlotLeave } from "../slot_leave.tsx";
import { rejectWrite } from "../reject_write.tsx";

export const chrome = group(({ route }) => ({
  layouts: [RootLayout],
  error: ErrorPage,
  routes: [
    route("/entries", { GET: listEntries, POST: write }),
    route("/reject-write", { POST: rejectWrite }),
    route("/entries-form", { GET: listEntriesForm }),
    route("/search", { GET: Search }),
    route("/slow-write", { GET: SlowWrite, POST: postSlow }),
    route("/wrote", { GET: Wrote }),
    route("/writes", { GET: writesHandler }),
    route("/json-write", { GET: jsonWriteHandler, POST: jsonWriteHandler }),
    route("/drop-write", { GET: dropWriteHandler, POST: dropWriteHandler }),
    route("/slot-page", { GET: SlotPage }),
    route("/slot-hole", { GET: listSlotHole, POST: updateSlotHole }),
    route("/slot-leave", { GET: listSlotLeave, POST: leave }),
  ],
}));
