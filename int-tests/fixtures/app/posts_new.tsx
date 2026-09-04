import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function PostsNew(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="new-post">new-post</p>);
}
