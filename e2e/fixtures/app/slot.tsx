import { type ReadArgs } from "dashi";

export function list({ html }: ReadArgs) {
  return html(<span id="slot-inside">inside</span>);
}
