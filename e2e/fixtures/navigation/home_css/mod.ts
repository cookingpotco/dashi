import { group, staticFile, type WrapperCtx } from "dashi";
import type { AppState } from "../state.ts";

const staticDir = `${import.meta.dirname}/../static`;

export const homeCss = group<AppState>(
  "/home.css",
  ({ route }) => ({
    routes: [route("/", { GET: homeCssHandler })],
  }),
);

function homeCssHandler(ctx: WrapperCtx<AppState>) {
  return staticFile(ctx, staticDir, "home.css");
}
