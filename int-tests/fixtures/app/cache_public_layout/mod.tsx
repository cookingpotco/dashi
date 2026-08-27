import { group } from "dashi";
import type { AppState } from "../state.ts";
import { CachePublicLayout } from "./cache_public_layout.tsx";
import { CacheFromLayout } from "../cache_from_layout_route.tsx";
import { CacheNoStore } from "../cache_nostore_route.tsx";

export const cachePublicLayout = group<AppState>(({ route }) => ({
  layouts: [CachePublicLayout],
  routes: [
    route("/cache-from-layout", { GET: CacheFromLayout }),
    route("/cache-nostore", { GET: CacheNoStore }),
  ],
}));
