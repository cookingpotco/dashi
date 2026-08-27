import { group } from "dashi";
import type { AppState } from "../state.ts";
import { throwHandler, throwingError } from "../errors.tsx";

export const nestedErrorThrows = group<AppState>(({ route }) => ({
  error: throwingError,
  routes: [route("/nested-error-throws", { GET: throwHandler })],
}));
