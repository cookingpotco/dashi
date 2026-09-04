import { type Ctx, patch, type Patches } from "dashi";
import type { AppState } from "./state.ts";

export function post(
  _ctx: Ctx<Record<string, never>, AppState>,
  patches: Patches,
) {
  return patches([
    patch.append("#todos", <li>milk</li>),
    patch.replace("/todo-count", <span>3</span>),
    patch.replace("#status", <p>Saved</p>),
    patch.refresh("/hits"),
    patch.prepend("/todos", <li>bread</li>),
    patch.before("/slot", <p>before</p>),
    patch.after("/slot", <p>after</p>),
  ]);
}

export function postUnprocessable(
  _ctx: Ctx<Record<string, never>, AppState>,
  patches: Patches,
) {
  return patches([
    patch.replace("#status", <p>invalid</p>),
  ], { status: 422 });
}
