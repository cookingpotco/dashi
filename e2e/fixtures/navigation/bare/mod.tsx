import { group } from "dashi";
import type { AppState } from "../state.ts";

export const bare = group<AppState>("/bare", ({ route }) => ({
  routes: [route("/", { GET: Bare })],
}));

function Bare() {
  return <p id="heading">bare</p>;
}
