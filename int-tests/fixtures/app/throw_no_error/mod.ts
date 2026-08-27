import { group } from "dashi";
import type { AppState } from "../state.ts";
import { noErrorLayout, throwHandler } from "../errors.tsx";

export const throwNoError = group<AppState>(({ route }) => ({
  layouts: [noErrorLayout],
  routes: [route("/throw-no-error", { GET: throwHandler })],
}));
