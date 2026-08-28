import { group } from "dashi";

export const slot = group("/slot", ({ route }) => ({
  routes: [route("/", { GET: list })],
}));

function list() {
  return <span id="slot-inside">inside</span>;
}
