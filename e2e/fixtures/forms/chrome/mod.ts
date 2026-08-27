import { group } from "dashi";
import { RootLayout } from "../root_layout.tsx";
import { ErrorPage } from "../errors.tsx";
import { entries } from "../entries/mod.tsx";
import { entriesForm } from "../entries_form/mod.tsx";
import { search } from "../search/mod.tsx";
import { slowWrite } from "../slow_write/mod.tsx";
import { wrote } from "../wrote/mod.tsx";
import { writes } from "../writes/mod.ts";
import { jsonWrite } from "../json_write/mod.ts";
import { fragPage } from "../frag_page/mod.tsx";
import { frag } from "../frag/mod.tsx";
import { fragLeave } from "../frag_leave/mod.tsx";

export const chrome = group(() => ({
  layouts: [RootLayout],
  error: ErrorPage,
  routes: [
    entries,
    entriesForm,
    search,
    slowWrite,
    wrote,
    writes,
    jsonWrite,
    fragPage,
    frag,
    fragLeave,
  ],
}));
