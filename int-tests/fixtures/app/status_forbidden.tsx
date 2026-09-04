import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function statusForbidden(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(<p id="status-forbidden">handler-403</p>, { status: 403 });
}
