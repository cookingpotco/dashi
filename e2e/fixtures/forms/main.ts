import { serve } from "dashi";
import { fatal } from "./errors.tsx";
import { chrome } from "./chrome/mod.ts";
import { bareChrome } from "./bare_chrome/mod.ts";

if (import.meta.main) {
  serve(() => ({
    routes: [chrome, bareChrome],
  }), { fatal, port: 0 });
}
