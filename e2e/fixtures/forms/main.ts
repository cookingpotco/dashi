import { serve } from "dashi";
import { fatal } from "./errors.tsx";
import { chrome } from "./chrome/mod.ts";
import { bareChrome } from "./bare_chrome/mod.ts";

export function start() {
  return serve(() => ({
    routes: [chrome, bareChrome],
  }), { fatal, hostname: "127.0.0.1", port: 0 });
}
