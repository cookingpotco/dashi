import { type Ctx, type SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export function About(
  ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
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
