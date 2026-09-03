import { group } from "dashi";
import { requireAuth } from "../auth_middleware.ts";

export const secret = group(({ route }) => ({
  middleware: [requireAuth],
  routes: [route("/secret", { GET: Secret })],
}));

function Secret() {
  return <p>Classified</p>;
}
