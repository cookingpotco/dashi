import { group } from "dashi";
import type { AppState } from "../state.ts";
import { compactError, throwHandler } from "../errors.tsx";

export const slotError = group<AppState>("/", ({ route }) => ({
  error: compactError,
  routes: [route("/slot-error", { GET: throwHandler })],
}));
