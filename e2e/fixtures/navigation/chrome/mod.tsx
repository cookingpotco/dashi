import { group } from "dashi";
import type { AppState } from "../state.ts";
import { RootLayout } from "../root_layout.tsx";
import { ErrorPage } from "../errors.tsx";
import { Home } from "../home.tsx";
import { About } from "../about.tsx";
import { Tall } from "../tall.tsx";
import { WidgetPage } from "../widget/mod.tsx";
import { Slow } from "../slow.tsx";
import { homeCss } from "../home_css.ts";
import { aboutCss } from "../about_css.ts";
import { data } from "../data.ts";

export { GoAbout } from "./go_about.tsx";

export const chrome = group<AppState>(({ route }) => ({
  layouts: [RootLayout],
  error: ErrorPage,
  routes: [
    route("/", { GET: Home }),
    route("/about", { GET: About }),
    route("/tall", { GET: Tall }),
    route("/widget", { GET: WidgetPage }),
    route("/slow", { GET: Slow }),
    route("/home.css", { GET: homeCss }),
    route("/about.css", { GET: aboutCss }),
    route("/data", { GET: data }),
  ],
}));
