import type { GroupCallback, GroupFields } from "dashi";
import type { AppState } from "./state.ts";
import { NotFound } from "./errors.tsx";
import { chrome } from "./chrome/mod.tsx";
import { bareChrome } from "./bare_chrome/mod.ts";

export function app(_cb: GroupCallback<"", AppState>): GroupFields<AppState> {
  return {
    notFound: NotFound,
    routes: [chrome, bareChrome],
  };
}
