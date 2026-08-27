import { group } from "dashi";

export const failFrag = group("/fail-frag", ({ route }) => ({
  routes: [route("/", { GET: FailFrag })],
}));

function FailFrag(): never {
  throw new Error("fail-frag");
}
