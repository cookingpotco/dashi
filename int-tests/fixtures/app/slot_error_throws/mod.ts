import { group } from "dashi";
import type { AppState } from "../state.ts";
import { throwHandler, throwingError } from "../errors.tsx";

export const slotErrorThrows = group<AppState>("/", ({ route }) => ({
  error: throwingError,
  routes: [route("/slot-error-throws", { GET: throwHandler })],
}));
