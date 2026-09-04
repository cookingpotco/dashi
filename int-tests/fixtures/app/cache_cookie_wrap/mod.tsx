import { group } from "dashi";
import type { AppState } from "../state.ts";
import { CacheCookieWrap } from "./cache_cookie_wrap.tsx";
import { CacheNoStoreOverCookie } from "./cache_nostore_over_cookie.tsx";

export const cacheCookieWrap = group<AppState>(({ route }) => ({
  layouts: [CacheCookieWrap],
  routes: [
    route("/cache-nostore-over-cookie", { GET: CacheNoStoreOverCookie }),
  ],
}));
