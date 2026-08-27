import { group } from "dashi";
import { ErrorPage } from "../errors.tsx";

export const failFrag = group("/fail-frag", ({ route }) => ({
  error: ErrorPage,
  routes: [route("/", { GET: FailFrag })],
}));

function FailFrag(): never {
  throw new Error("fail-frag");
}
