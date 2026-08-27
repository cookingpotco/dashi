import { group } from "dashi";
import type { AppState } from "../state.ts";
import { okPage, throwingLayout } from "../errors.tsx";

export const nestedLayoutThrowsNoError = group<AppState>(({ route }) => ({
  layouts: [throwingLayout],
  routes: [route("/nested-layout-throws-no-error", { GET: okPage })],
}));
