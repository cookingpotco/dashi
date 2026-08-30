import { group, patch } from "dashi";

export const notice = group("/notice", ({ route }) => ({
  routes: [route("/", { GET: list, POST: dismiss })],
}));

function list() {
  return (
    <div id="notice">
      <p>Try dismiss — it removes this fragment.</p>
      <form method="POST" action="/notice">
        <button type="submit">Dismiss</button>
      </form>
    </div>
  );
}

function dismiss() {
  return [patch.remove("/notice")];
}
