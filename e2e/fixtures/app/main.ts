import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { Embed } from "./embed_route.tsx";
import { Fragment } from "./fragment_route.tsx";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    routes: [
      route("/", { GET: Home }),
      route("/embed", { GET: Embed }),
      route("/fragment", { GET: Fragment }),
    ],
  }), { port: 0 });
}
