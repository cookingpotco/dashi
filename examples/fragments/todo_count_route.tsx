import { todos } from "./todos.ts";

export function list() {
  return <span id="todo-count">{todos.length}</span>;
}
