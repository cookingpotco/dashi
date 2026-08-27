import { group } from "dashi";
import type { AppState } from "../state.ts";
import { jsonError, throwHandler } from "../errors.tsx";

export const jsonThrow = group<AppState>(({ route }) => ({
  error: jsonError,
  routes: [route("/json-throw", { GET: throwHandler })],
}));
