import { route, serve } from "dashi";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import fragment from "./routes/fragment.tsx";

if (import.meta.main) {
  serve({
    layouts: [root],
    middleware: [logger],
    routes: [
      route("/", home),
      route("/fragment", fragment),
    ],
  });
}
