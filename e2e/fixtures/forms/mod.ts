import type { GroupCallback, GroupFields } from "dashi";
import { chrome } from "./chrome/mod.ts";
import { bareChrome } from "./bare_chrome/mod.ts";

export function app(_cb: GroupCallback): GroupFields {
  return {
    routes: [chrome, bareChrome],
  };
}
