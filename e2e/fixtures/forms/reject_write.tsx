import { type Ctx, patch, type Patches } from "dashi";

export function rejectWrite(_ctx: Ctx, patches: Patches) {
  return patches([
    patch.replace("#reject-status", <p id="reject-status">rejected</p>),
  ], { status: 422 });
}
