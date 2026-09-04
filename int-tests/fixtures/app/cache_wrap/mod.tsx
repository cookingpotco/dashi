import { group } from "dashi";
import type { AppState } from "../state.ts";
import { CacheWrap } from "./cache_wrap.tsx";
import { CacheDefault } from "./cache_default.tsx";
import { CacheNoStore } from "./cache_nostore.tsx";

export const cacheWrap = group<AppState>(({ route }) => ({
  layouts: [CacheWrap],
  routes: [
    route("/cache-default", { GET: CacheDefault }),
    route("/cache-nostore", { GET: CacheNoStore }),
  ],
}));
