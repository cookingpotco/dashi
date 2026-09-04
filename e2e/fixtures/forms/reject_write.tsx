import { patch, type WriteArgs } from "dashi";

export function rejectWrite({ patches }: WriteArgs) {
  return patches([
    patch.replace("#reject-status", <p id="reject-status">rejected</p>),
  ], { status: 422 });
}
