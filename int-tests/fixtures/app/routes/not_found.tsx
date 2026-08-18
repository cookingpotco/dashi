import type { Ctx } from "dashi";
import type { AppState } from "../state.ts";

export default function NotFound(
  ctx: Ctx<Record<string, string>, AppState>,
) {
  if (ctx.url.pathname === "/not-found-throws") {
    throw new Error("not-found-throws");
  }
  return <p id="not-found">custom-404</p>;
}
