import { group } from "dashi";
import type { AppState } from "../state.ts";
import { compactError, throwHandler } from "../errors.tsx";

export const fragError = group<AppState>(({ route }) => ({
  error: compactError,
  routes: [route("/frag-error", { GET: throwHandler })],
}));
