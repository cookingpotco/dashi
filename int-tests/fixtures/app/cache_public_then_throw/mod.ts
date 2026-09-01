import { group } from "dashi";
import type { AppState } from "../state.ts";
import { CachePublic } from "../cache_public.tsx";
import { throwingLayout } from "../errors.tsx";

export const cachePublicThenThrow = group<AppState>(({ route }) => ({
  layouts: [throwingLayout],
  routes: [route("/cache-public-then-throw", { GET: CachePublic })],
}));
