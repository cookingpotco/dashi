import { group } from "dashi";
import { cors } from "dashi/cors";
import type { AppState } from "../state.ts";
import { ok } from "../ok/mod.ts";

export const corsStar = group<AppState>(({ route }) => ({
  middleware: [cors()],
  routes: [route("/cors-star", { GET: ok })],
}));
