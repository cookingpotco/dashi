import { client, type Ctx, group } from "dashi";
import type { AppState } from "../state.ts";
import { RootLayout } from "../root_layout.tsx";
import { ErrorPage } from "../errors.tsx";
import { about } from "../about/mod.tsx";
import { tall } from "../tall/mod.tsx";
import { widget } from "../widget/mod.tsx";
import { slow } from "../slow/mod.tsx";
import { homeCss } from "../home_css/mod.ts";
import { aboutCss } from "../about_css/mod.ts";
import { data } from "../data/mod.ts";

const GoAbout = client.element(
  "go-about",
  new URL("./go_client.ts", import.meta.url),
);

export const chrome = group<AppState>(({ route }) => ({
  layouts: [RootLayout],
  error: ErrorPage,
  routes: [
    route("/", { GET: Home }),
    about,
    tall,
    widget,
    slow,
    homeCss,
    aboutCss,
    data,
  ],
}));

function Home(ctx: Ctx<Record<string, never>, AppState>) {
  ctx.state.title = "home";
  ctx.state.stylesheet = "/home.css";
  return (
    <div>
      <h1 id="heading">home</h1>
      <p>
        <a id="to-about" href="/about">About</a>
        <a id="to-tall" href="/tall">Tall</a>
        <a id="to-widget" href="/widget">Widget</a>
        <a id="to-slow" href="/slow">Slow</a>
        <a id="to-json" href="/data">JSON</a>
        <a id="to-opt-out" href="/about" hardNavigation>Opt out</a>
        <a id="to-bare" href="/bare">Bare</a>
        <a id="to-missing" href="/missing">Missing</a>
        <a id="to-cross" href="https://example.invalid/">Cross</a>
        <GoAbout id="go-about">Go about</GoAbout>
      </p>
    </div>
  );
}
