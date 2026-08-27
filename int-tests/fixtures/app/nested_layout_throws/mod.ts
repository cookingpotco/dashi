import { group } from "dashi";
import type { AppState } from "../state.ts";
import { nestedError, okPage, throwingLayout } from "../errors.tsx";

export const nestedLayoutThrows = group<AppState>(({ route }) => ({
  layouts: [throwingLayout],
  error: nestedError,
  routes: [route("/nested-layout-throws", { GET: okPage })],
}));
