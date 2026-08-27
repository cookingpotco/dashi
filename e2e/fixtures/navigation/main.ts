import { serve } from "dashi";
import type { AppState } from "./state.ts";
import { errorFallback, NotFound } from "./errors.tsx";
import { chrome } from "./chrome/mod.tsx";
import { bareChrome } from "./bare_chrome/mod.ts";

if (import.meta.main) {
  serve<AppState>(() => ({
    notFound: NotFound,
    routes: [chrome, bareChrome],
  }), { errorFallback, port: 0 });
}
