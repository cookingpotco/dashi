import type { ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export function Home({ ctx, html }: ReadArgs<Record<string, never>, AppState>) {
  const q = ctx.url.searchParams.get("q") ?? "";
  const title = ctx.url.searchParams.get("title") ?? "";
  return html(<p title={title}>{q}</p>);
}
