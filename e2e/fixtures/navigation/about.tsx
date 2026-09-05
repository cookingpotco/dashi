import { type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function About(
  { ctx, html }: ReadArgs<AppState>,
) {
  ctx.state.title = "about";
  ctx.state.stylesheet = "/about.css";
  return html(
    <div>
      <h1 id="heading">about</h1>
      <input id="about-field" autoFocus />
      <a id="to-home" href="/">Home</a>
    </div>,
  );
}
