import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function PostsNew({ html }: ReadArgs<AppState>) {
  return html(<p id="new-post">new-post</p>);
}
