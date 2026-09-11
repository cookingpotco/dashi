import { group } from "dashi";
import type { AppState } from "../state.ts";
import { responseError, throwHandler } from "../errors.tsx";

export const slotErrorResponse = group<AppState>("/", ({ route }) => ({
  error: responseError,
  routes: [route("/slot-error-response", { GET: throwHandler })],
}));
