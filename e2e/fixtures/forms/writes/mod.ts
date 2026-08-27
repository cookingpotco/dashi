import { group } from "dashi";
import { writeCount } from "../writes.ts";

export const writes = group("/writes", ({ route }) => ({
  routes: [route("/", { GET: writesHandler })],
}));

function writesHandler() {
  return new Response(String(writeCount()));
}
