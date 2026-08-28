import { fragment, group } from "dashi";

export const inserts = group("/inserts", ({ route }) => ({
  routes: [route("/", { GET: form, POST: apply })],
}));

function form() {
  return (
    <form id="inserts-form" method="POST" action="/inserts">
      <button type="submit">Insert</button>
    </form>
  );
}

function apply() {
  return [
    fragment.prepend("/slot", <span id="prepended">pre</span>),
    fragment.before("/slot", <span id="before-slot">before</span>),
    fragment.after("/slot", <span id="after-slot">after</span>),
  ];
}
