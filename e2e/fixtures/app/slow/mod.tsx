import { group } from "dashi";

export const slow = group("/slow", ({ route }) => ({
  routes: [route("/", { GET: Slow })],
}));

async function Slow() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return <p id="slow-body">slow-body</p>;
}
