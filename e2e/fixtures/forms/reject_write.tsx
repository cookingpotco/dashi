import { type Ctx, patch, type SealPatches } from "dashi";

export function rejectWrite(_ctx: Ctx, patches: SealPatches) {
  return patches([
    patch.replace("#reject-status", <p id="reject-status">rejected</p>),
  ], { status: 422 });
}
