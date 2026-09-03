import { serve } from "dashi";
import { error, fatal, notFound } from "./errors.tsx";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";
import { list as spotlight } from "./spotlight/mod.tsx";
import { todos } from "./todos/mod.tsx";
import { list as weather } from "./weather/mod.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      todos,
      route("/weather", { GET: weather }),
      route("/spotlight", { GET: spotlight }),
    ],
  }), { fatal });
}
