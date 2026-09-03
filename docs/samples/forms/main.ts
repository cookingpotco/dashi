import { serve } from "dashi";
import { error, fatal, notFound } from "./errors.tsx";
import { add, list } from "./guestbook/mod.tsx";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/guestbook", { GET: list, POST: add }),
    ],
  }), { fatal });
}
