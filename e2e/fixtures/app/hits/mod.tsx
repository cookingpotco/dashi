import { group } from "dashi";

let count = 0;

export const hits = group("/hits", ({ route }) => ({
  routes: [route("/", { GET: list })],
}));

function list() {
  count += 1;
  return <span id="refresh-stamp">{count}</span>;
}
