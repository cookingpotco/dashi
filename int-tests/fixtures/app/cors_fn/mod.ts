import { group } from "dashi";
import { cors } from "dashi/cors";
import type { AppState } from "../state.ts";
import { ok } from "../ok/mod.ts";

export const corsFn = group<AppState>(({ route }) => ({
  middleware: [cors({
    origin: (origin) => origin === "https://app.example" ? origin : undefined,
  })],
  routes: [route("/cors-fn", { GET: ok })],
}));
