import { group } from "dashi";
import type { AppState } from "../state.ts";

export const data = group<"/data", AppState>("/data", ({ route }) => ({
  routes: [route("/", { GET: dataHandler })],
}));

function dataHandler() {
  return Response.json({ kind: "json" });
}
