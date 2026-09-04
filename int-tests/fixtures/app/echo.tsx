import type { Ctx, SealHtml } from "dashi";
import type { AppState } from "./state.ts";

export async function Echo(
  ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  const id = ctx.url.searchParams.get("id") ?? "";
  await new Promise((resolve) => setTimeout(resolve, 50));
  return html(<p id="echo">{id}</p>);
}
