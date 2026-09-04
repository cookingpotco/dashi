import { type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

export async function Slow(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return html(
    <div>
      <h1 id="heading">slow</h1>
    </div>,
  );
}
