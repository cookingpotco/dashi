import { group } from "dashi";

export const jsonWrite = group("/json-write", ({ route }) => ({
  routes: [route("/", { GET: jsonWriteHandler, POST: jsonWriteHandler })],
}));

function jsonWriteHandler() {
  return Response.json({ kind: "json" });
}
