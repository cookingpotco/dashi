import { group } from "dashi";
import { todos } from "../todos.ts";

export const todoCount = group("/todo-count", ({ route }) => ({
  routes: [route("/", { GET: list })],
}));

function list() {
  return <span id="todo-count">{todos.length}</span>;
}
