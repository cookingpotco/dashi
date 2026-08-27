import { group } from "dashi";
import type { AppState } from "../state.ts";
import { CachePrivateLayout } from "./cache_private_layout.tsx";
import { CacheOverride } from "../cache_override_route.tsx";

export const cachePrivateLayout = group<AppState>(({ route }) => ({
  layouts: [CachePrivateLayout],
  routes: [route("/cache-override", { GET: CacheOverride })],
}));
