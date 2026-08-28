import { group } from "dashi";
import type { AppState } from "../state.ts";

export const slow = group<AppState>("/slow", ({ route }) => ({
  routes: [route("/", { GET: Slow })],
}));

async function Slow() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return (
    <div>
      <h1 id="heading">slow</h1>
    </div>
  );
}
