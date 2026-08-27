import { group } from "dashi";
import type { AppState } from "../state.ts";
import { throwHandler } from "../errors.tsx";

export const fragThrow = group<AppState>(({ route }) => ({
  routes: [route("/frag-throw", { GET: throwHandler })],
}));
