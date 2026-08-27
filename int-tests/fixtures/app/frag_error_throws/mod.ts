import { group } from "dashi";
import type { AppState } from "../state.ts";
import { throwHandler, throwingError } from "../errors.tsx";

export const fragErrorThrows = group<AppState>(({ route }) => ({
  error: throwingError,
  routes: [route("/frag-error-throws", { GET: throwHandler })],
}));
