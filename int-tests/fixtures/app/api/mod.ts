import { group, type Middleware } from "dashi";
import type { AppState } from "../state.ts";
import { ApiLayout } from "./api_layout.tsx";
import { ApiNotFound } from "../errors.tsx";
import { ok } from "../ok_route.ts";
import { v2 } from "./v2/mod.ts";

const apiMw: Middleware<AppState> = async (_ctx, next) => {
  const res = await next();
  res.headers.set("x-api", "1");
  return res;
};

export const api = group<"/api", AppState>("/api", ({ route }) => ({
  layouts: [ApiLayout],
  middleware: [apiMw],
  notFound: ApiNotFound,
  routes: [
    route("/ok", { GET: ok }),
    v2,
  ],
}));
