import { type ReadArgs } from "dashi";

export function list({ html }: ReadArgs) {
  return html(
    <span id="current-time">
      Current time: {new Date().toISOString()}
    </span>,
  );
}
