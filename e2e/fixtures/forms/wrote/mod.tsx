import { group } from "dashi";

export const wrote = group("/wrote", ({ route }) => ({
  routes: [route("/", { GET: Wrote })],
}));

function Wrote() {
  return (
    <div>
      <h1 id="heading">wrote</h1>
    </div>
  );
}
