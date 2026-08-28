import { group } from "dashi";
import type { AppState } from "../state.ts";

export const aboutCss = group<AppState>(
  "/about.css",
  ({ route }) => ({
    routes: [route("/", { GET: aboutCssHandler })],
  }),
);

async function aboutCssHandler() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return new Response("#heading { color: rgb(0, 0, 255); }", {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
}
