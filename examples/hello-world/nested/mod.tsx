import { group } from "dashi";
import { NestedLayout } from "./nested_layout.tsx";

export const nested = group("/nested", ({ route }) => ({
  layouts: [NestedLayout],
  routes: [route("/", { GET: Nested })],
}));

function Nested() {
  return (
    <div>
      <code>nested</code>
    </div>
  );
}
