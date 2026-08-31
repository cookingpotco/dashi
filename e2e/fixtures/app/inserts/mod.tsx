import { group, patch } from "dashi";

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
    patch.prepend("/slot", <span id="prepended">pre</span>),
    patch.before("/slot", <span id="before-slot">before</span>),
    patch.after("/slot", <span id="after-slot">after</span>),
  ];
}
