import { type Layout } from "dashi";
import type { AppState } from "../../state.ts";

const NestedLayout: Layout<AppState> = (_ctx, children) => {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
};

export default NestedLayout;
