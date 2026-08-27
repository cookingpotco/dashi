import { group } from "dashi";
import type { AppState } from "../state.ts";

export const tall = group<"/tall", AppState>("/tall", ({ route }) => ({
  routes: [route("/", { GET: Tall })],
}));

function Tall() {
  return (
    <div>
      <h1 id="heading">tall</h1>
      <a id="to-widget" href="/widget">Widget</a>
      <a id="to-about" href="/about">About</a>
      <a id="to-marker" href="#marker">Jump</a>
      <div style="height: 3000px"></div>
      <p id="marker">marker</p>
      <div style="height: 3000px"></div>
    </div>
  );
}
