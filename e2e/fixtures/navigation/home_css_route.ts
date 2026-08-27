import { staticFile, type WrapperCtx } from "dashi";
import type { AppState } from "./state.ts";

const staticDir = `${import.meta.dirname}/static`;

export function homeCss(ctx: WrapperCtx<AppState>) {
  return staticFile(ctx, staticDir, "home.css");
}
