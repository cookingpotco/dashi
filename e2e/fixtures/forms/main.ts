import { type GroupCallback, type GroupFields, serve } from "dashi";
import { errorFallback } from "./errors.tsx";
import { chrome } from "./chrome/mod.ts";
import { bareChrome } from "./bare_chrome/mod.ts";

function app(_cb: GroupCallback): GroupFields {
  return {
    routes: [chrome, bareChrome],
  };
}

if (import.meta.main) {
  serve(app, { errorFallback, port: 0 });
}
