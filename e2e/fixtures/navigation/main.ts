import { serve } from "dashi";
import type { AppState } from "./state.ts";
import { fatal, NotFound } from "./errors.tsx";
import { chrome } from "./chrome/mod.tsx";
import { bareChrome } from "./bare_chrome/mod.ts";

export function start() {
  return serve<AppState>(() => ({
    notFound: NotFound,
    routes: [chrome, bareChrome],
  }), { fatal, hostname: "127.0.0.1", port: 0 });
}
