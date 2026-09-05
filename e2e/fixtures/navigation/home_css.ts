import { type ReadArgs, staticFile } from "dashi";
import type { AppState } from "./state.ts";

const staticDir = `${import.meta.dirname}/static`;

export function homeCss({ ctx }: ReadArgs<AppState, Record<string, string>>) {
  return staticFile(ctx, staticDir, "home.css");
}
