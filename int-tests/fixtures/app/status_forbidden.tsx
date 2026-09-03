import { status } from "dashi";

export function statusForbidden() {
  return status(403, <p id="status-forbidden">handler-403</p>);
}
