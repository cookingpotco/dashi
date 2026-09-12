import { group } from "dashi";
import type { AppState } from "../state.ts";
import { throwHandler } from "../errors.tsx";

export const slotThrow = group<AppState>("/", ({ route }) => ({
  routes: [route("/slot-throw", { GET: throwHandler })],
}));
