import { patch, status } from "dashi";

export function post() {
  return status(400, [
    patch.replace("#status", <p>title required</p>),
  ]);
}
