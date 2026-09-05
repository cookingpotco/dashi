import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function statusForbidden(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(<p id="status-forbidden">handler-403</p>, { status: 403 });
}
