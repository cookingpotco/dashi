import type { Ctx } from "dashi";
import type { AppState } from "./state.ts";

export async function Echo(ctx: Ctx<Record<string, never>, AppState>) {
  const id = ctx.url.searchParams.get("id") ?? "";
  await new Promise((resolve) => setTimeout(resolve, 50));
  return <p id="echo">{id}</p>;
}
