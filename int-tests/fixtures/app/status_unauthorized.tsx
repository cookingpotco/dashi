import { status } from "dashi";

export function statusUnauthorized() {
  return status(401, <p id="status-unauthorized">handler-401</p>);
}
