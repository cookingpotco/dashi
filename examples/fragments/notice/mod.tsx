import { patch } from "dashi";

export function list() {
  return (
    <div id="notice">
      <p>Try dismiss — it removes this fragment.</p>
      <form method="POST" action="/notice">
        <button type="submit">Dismiss</button>
      </form>
    </div>
  );
}

export function dismiss() {
  return [patch.remove("/notice")];
}
