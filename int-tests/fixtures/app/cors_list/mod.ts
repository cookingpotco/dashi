import { group } from "dashi";
import { cors } from "dashi/cors";
import type { AppState } from "../state.ts";
import { ok } from "../ok_route.ts";
import { CacheCors } from "../cache_cors_route.tsx";

export const corsList = group<AppState>(({ route }) => ({
  middleware: [cors({
    origin: ["https://app.example", "https://other.example"],
  })],
  routes: [
    route("/cors-list", { GET: ok }),
    route("/cache-cors", { GET: CacheCors }),
  ],
}));
