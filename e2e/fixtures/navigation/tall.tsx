import { type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function Tall({ html }: ReadArgs<{ state: AppState }>) {
  return html(
    <div>
      <h1 id="heading">tall</h1>
      <a id="to-widget" href="/widget">Widget</a>
      <a id="to-about" href="/about">About</a>
      <a id="to-marker" href="#marker">Jump</a>
      <div style="height: 3000px"></div>
      <p id="marker">marker</p>
      <div style="height: 3000px"></div>
    </div>,
  );
}
