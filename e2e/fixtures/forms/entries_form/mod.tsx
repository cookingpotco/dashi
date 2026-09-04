import { type Ctx, type SealHtml } from "dashi";
import { EntriesForm } from "../entries_form.tsx";

export function list(_ctx: Ctx, html: SealHtml) {
  return html(<EntriesForm />);
}
