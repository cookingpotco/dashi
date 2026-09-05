import type { ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

export function CacheDefault(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(<p id="cache-default">from-handler</p>);
}
