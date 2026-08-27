import { group } from "dashi";
import { EntriesForm } from "../entries_form.tsx";

export const entriesForm = group("/entries-form", ({ route }) => ({
  routes: [route("/", { GET: list })],
}));

function list() {
  return <EntriesForm />;
}
