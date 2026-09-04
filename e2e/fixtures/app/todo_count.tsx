import { type Ctx, type Html } from "dashi";

export function list(_ctx: Ctx, html: Html) {
  return html(<span id="todo-count">0</span>);
}
