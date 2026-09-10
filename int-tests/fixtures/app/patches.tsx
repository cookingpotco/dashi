import { patch, type WriteArgs } from "dashi";
import type { AppState } from "./state.ts";

export function post({ patches }: WriteArgs<{ state: AppState }>) {
  return patches([
    patch.append("#todos", <li>milk</li>),
    patch.update("#todo-count", <span>3</span>),
    patch.update("#status", <p>Saved</p>),
    patch.refresh("/hits"),
    patch.prepend("#todos", <li>bread</li>),
    patch.before("#slot", <p>before</p>),
    patch.after("#slot", <p>after</p>),
  ]);
}

export function postUnprocessable(
  { patches }: WriteArgs<{ state: AppState }>,
) {
  return patches([
    patch.update("#status", <p>invalid</p>),
  ], { status: 422 });
}
