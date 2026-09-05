import { group, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";
import { NestedLayout } from "./nested_layout.tsx";

export const nested = group<AppState>(({ route }) => ({
  layouts: [NestedLayout],
  routes: [route("/nested", { GET: Nested })],
}));

function Nested({ html }: ReadArgs<{ state: AppState }>) {
  return html(
    <div>
      <code>nested</code>
    </div>,
  );
}
