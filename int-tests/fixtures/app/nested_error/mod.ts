import { group } from "dashi";
import type { AppState } from "../state.ts";
import {
  nestedError as nestedErrorPage,
  nestedErrorLayout,
  nestedMw,
  throwHandler,
} from "../errors.tsx";

export const nestedError = group<AppState>(({ route }) => ({
  layouts: [nestedErrorLayout],
  middleware: [nestedMw],
  error: nestedErrorPage,
  routes: [route("/nested-error", { GET: throwHandler })],
}));
