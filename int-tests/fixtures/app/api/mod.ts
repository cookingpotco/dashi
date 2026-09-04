import { group, type MiddlewareArgs } from "dashi";
import type { AppState } from "../state.ts";
import { ApiLayout } from "./api_layout.tsx";
import { ApiNotFound } from "../errors.tsx";
import { ok } from "../ok/mod.ts";
import { v2 } from "./v2/mod.ts";

async function apiMw({ next }: MiddlewareArgs<AppState>) {
  const res = await next();
  res.headers.set("x-api", "1");
  return res;
}

export const api = group<AppState>("/api", ({ route }) => ({
  layouts: [ApiLayout],
  middleware: [apiMw],
  notFound: ApiNotFound,
  routes: [
    route("/ok", { GET: ok }),
    v2,
  ],
}));
