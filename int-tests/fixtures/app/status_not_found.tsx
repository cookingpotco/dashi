import { status } from "dashi";

export function statusNotFound() {
  return status(404, <p id="status-not-found">handler-404</p>);
}
