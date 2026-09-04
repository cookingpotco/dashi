import { type Ctx, type SealHtml } from "dashi";

export function list(_ctx: Ctx, html: SealHtml) {
  return html(<span id="todo-count">0</span>);
}
