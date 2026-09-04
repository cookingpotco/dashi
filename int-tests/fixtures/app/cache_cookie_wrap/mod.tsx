import { group } from "dashi";
import type { AppState } from "../state.ts";
import { CachePublicCookieLayout } from "./cache_public_cookie_layout.tsx";
import { CacheNoStoreOverCookie } from "./cache_nostore_over_cookie.tsx";

export const cachePublicCookieLayout = group<AppState>(({ route }) => ({
  layouts: [CachePublicCookieLayout],
  routes: [
    route("/cache-nostore-over-cookie", { GET: CacheNoStoreOverCookie }),
  ],
}));
