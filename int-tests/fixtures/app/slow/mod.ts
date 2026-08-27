import { group } from "dashi";
import type { AppState } from "../state.ts";
import { compactError, Slow } from "../errors.tsx";

export const slow = group<AppState>(({ route }) => ({
  error: compactError,
  routes: [route("/slow", { GET: Slow })],
}));
