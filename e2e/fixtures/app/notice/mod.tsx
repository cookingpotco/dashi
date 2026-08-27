import { fragment, group } from "dashi";

export const notice = group("/notice", ({ route }) => ({
  routes: [route("/", { GET: list, POST: dismiss })],
}));

function list() {
  return (
    <div id="notice">
      <p>Notice</p>
      <form id="dismiss-form" method="POST" action="/notice">
        <button type="submit">Dismiss</button>
      </form>
    </div>
  );
}

function dismiss() {
  return [fragment.remove("/notice")];
}
