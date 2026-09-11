import { patch, type WriteArgs } from "dashi";

export function rejectWrite({ patches }: WriteArgs) {
  return patches([
    patch.update("#reject-status", <>rejected</>),
  ], { status: 422 });
}
