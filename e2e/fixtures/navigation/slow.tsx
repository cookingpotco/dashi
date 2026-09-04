import { type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

export async function Slow(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return html(
    <div>
      <h1 id="heading">slow</h1>
    </div>,
  );
}
