import { type GroupCallback, type GroupFields, serve } from "dashi";
import type { AppState } from "./state.ts";
import { errorFallback, NotFound } from "./errors.tsx";
import { chrome } from "./chrome/mod.tsx";
import { bareChrome } from "./bare_chrome/mod.ts";

function app(_cb: GroupCallback<"", AppState>): GroupFields<AppState> {
  return {
    notFound: NotFound,
    routes: [chrome, bareChrome],
  };
}

if (import.meta.main) {
  serve(app, { errorFallback, port: 0 });
}
