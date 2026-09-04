import { type ReadArgs } from "dashi";
import { EntriesForm } from "../entries_form.tsx";

export function list({ html }: ReadArgs) {
  return html(<EntriesForm />);
}
