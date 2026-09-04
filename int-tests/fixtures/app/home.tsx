import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

export function Home(ctx: Ctx<Record<string, never>, AppState>, html: Html) {
  const q = ctx.url.searchParams.get("q") ?? "";
  const title = ctx.url.searchParams.get("title") ?? "";
  return html(<p title={title}>{q}</p>);
}
