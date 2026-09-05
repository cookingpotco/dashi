import { type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";
import { GoAbout } from "./chrome/mod.tsx";

export function Home({ ctx, html }: ReadArgs<{ state: AppState }>) {
  ctx.state.title = "home";
  ctx.state.stylesheet = "/home.css";
  return html(
    <div>
      <h1 id="heading">home</h1>
      <p>
        <a id="to-home" href="/">Home</a>
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
    </div>,
  );
}
