import { serve } from "dashi";
import { Home } from "./home_route.tsx";
import { About } from "./about_route.tsx";
import { Tall } from "./tall_route.tsx";
import { WidgetPage } from "./widget_route.tsx";
import { Slow } from "./slow_route.tsx";
import { data } from "./data_route.ts";
import { Bare } from "./bare_route.tsx";
import { RootLayout } from "./root_layout.tsx";
import { BareLayout } from "./bare_layout.tsx";
import { errorFallback, ErrorPage, NotFound } from "./errors.tsx";

if (import.meta.main) {
  serve(({ group }) => ({
    notFound: NotFound,
    routes: [
      group(({ route }) => ({
        layouts: [RootLayout],
        error: ErrorPage,
        routes: [
          route("/", { GET: Home }),
          route("/about", { GET: About }),
          route("/tall", { GET: Tall }),
          route("/widget", { GET: WidgetPage }),
          route("/slow", { GET: Slow }),
          route("/data", { GET: data }),
        ],
      })),
      group(({ route }) => ({
        layouts: [BareLayout],
        routes: [route("/bare", { GET: Bare })],
      })),
    ],
  }), { errorFallback, port: 0 });
}
