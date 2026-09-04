import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function statusUnauthorized(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(<p id="status-unauthorized">handler-401</p>, { status: 401 });
}
