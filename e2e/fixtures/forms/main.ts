import { serve } from "dashi";
import { errorFallback } from "./errors.tsx";
import { chrome } from "./chrome/mod.ts";
import { bareChrome } from "./bare_chrome/mod.ts";

if (import.meta.main) {
  serve(() => ({
    routes: [chrome, bareChrome],
  }), { errorFallback, port: 0 });
}
