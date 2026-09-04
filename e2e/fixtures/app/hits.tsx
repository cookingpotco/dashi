import { type ReadArgs } from "dashi";

let count = 0;

export function list({ html }: ReadArgs) {
  count += 1;
  return html(<span id="refresh-stamp">{count}</span>);
}
