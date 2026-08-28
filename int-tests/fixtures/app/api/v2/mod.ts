import { group } from "dashi";
import type { AppState } from "../../state.ts";
import { ApiV2NotFound } from "../../errors.tsx";
import { ok } from "../../ok_route.ts";

export const v2 = group<AppState>("/v2", ({ route }) => ({
  notFound: ApiV2NotFound,
  routes: [route("/ok", { GET: ok })],
}));
