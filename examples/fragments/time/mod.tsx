import { group } from "dashi";

export const time = group("/time", ({ route }) => ({
  routes: [route("/", { GET: list })],
}));

function list() {
  return (
    <span id="current-time">
      Current time: {new Date().toISOString()}
    </span>
  );
}
