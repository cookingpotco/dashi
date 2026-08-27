import { group } from "dashi";
import type { AppState } from "../state.ts";
import { okPage, throwingMw } from "../errors.tsx";

export const mwThrows = group<AppState>(({ route }) => ({
  middleware: [throwingMw],
  routes: [route("/mw-throws", { GET: okPage })],
}));
