import { group } from "dashi";

export const todoCount = group("/todo-count", ({ route }) => ({
  routes: [route("/", { GET: list })],
}));

function list() {
  return <span id="todo-count">0</span>;
}
