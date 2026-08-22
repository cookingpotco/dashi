import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    routes: [
      route("/", { GET: Home }),
    ],
  }), { port: 0 });
}
