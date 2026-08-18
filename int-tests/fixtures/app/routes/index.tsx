import type { Ctx } from "dashi";
import type { AppState } from "../state.ts";

export default function Home(ctx: Ctx<Record<string, never>, AppState>) {
  const q = ctx.url.searchParams.get("q") ?? "";
  const title = ctx.url.searchParams.get("title") ?? "";
  return <p title={title}>{q}</p>;
}
