import { group } from "dashi";
import type { AppState } from "../state.ts";
import { CacheOverrideWrap } from "./cache_override_wrap.tsx";
import { CacheOverride } from "./cache_override.tsx";

export const cacheOverrideWrap = group<AppState>(({ route }) => ({
  layouts: [CacheOverrideWrap],
  routes: [route("/cache-override", { GET: CacheOverride })],
}));
