import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function statusNotFound(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(<p id="status-not-found">handler-404</p>, { status: 404 });
}
