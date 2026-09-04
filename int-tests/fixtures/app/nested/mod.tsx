import { type Ctx, group, type SealHtml } from "dashi";
import type { AppState } from "../state.ts";
import { NestedLayout } from "./nested_layout.tsx";

export const nested = group<AppState>(({ route }) => ({
  layouts: [NestedLayout],
  routes: [route("/nested", { GET: Nested })],
}));

function Nested(_ctx: Ctx<Record<string, never>, AppState>, html: SealHtml) {
  return html(
    <div>
      <code>nested</code>
    </div>,
  );
}
