import { type ReadArgs } from "dashi";

export function list({ html }: ReadArgs) {
  return html(<span id="todo-count">0</span>);
}
