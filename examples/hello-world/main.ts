import { group, route, serve } from "dashi";
import home from "./routes/index.tsx";
import root from "./routes/_layout.tsx";
import logger from "./routes/_middleware.ts";
import nested from "./routes/nested/index.tsx";
import nestedLayout from "./routes/nested/_layout.tsx";
import secret from "./routes/secret.tsx";
import {
  add as addGuestbook,
  list as listGuestbook,
} from "./routes/guestbook.tsx";

if (import.meta.main) {
  serve({
    layouts: [root],
    middleware: [logger],
    routes: [
      route("/", { GET: home }),
      group({
        layouts: [nestedLayout],
        routes: [route("/nested", { GET: nested })],
      }),
      route("/secret", { GET: secret }),
      route("/guestbook", { GET: listGuestbook, POST: addGuestbook }),
    ],
  });
}
