import { type Ctx, group, type Html } from "dashi";
import { NestedLayout } from "./nested_layout.tsx";

export const nested = group("/nested", ({ route }) => ({
  layouts: [NestedLayout],
  routes: [route("/", { GET: Nested })],
}));

function Nested(_ctx: Ctx, html: Html) {
  return html(
    <div>
      <code>nested</code>
    </div>,
  );
}
