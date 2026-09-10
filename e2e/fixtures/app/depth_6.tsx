import { type ReadArgs } from "dashi";
import { recordDepthHit } from "./depth_stats.ts";

export function Depth6({ html }: ReadArgs) {
  recordDepthHit("/d6");
  return html(<p id="depth-leaf">depth-leaf</p>);
}
