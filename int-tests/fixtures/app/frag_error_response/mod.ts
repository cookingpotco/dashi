import { group } from "dashi";
import type { AppState } from "../state.ts";
import { responseError, throwHandler } from "../errors.tsx";

export const fragErrorResponse = group<AppState>(({ route }) => ({
  error: responseError,
  routes: [route("/frag-error-response", { GET: throwHandler })],
}));
