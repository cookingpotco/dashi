import { type Ctx, type Html } from "dashi";
import { EntriesForm } from "../entries_form.tsx";

export function list(_ctx: Ctx, html: Html) {
  return html(<EntriesForm />);
}
