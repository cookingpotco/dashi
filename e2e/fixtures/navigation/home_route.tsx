import { client, type Ctx } from "dashi";
import type { AppState } from "./state.ts";

const GoAbout = client.element(
  "go-about",
  new URL("./go_client.ts", import.meta.url),
);

export function Home(ctx: Ctx<Record<string, never>, AppState>) {
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
