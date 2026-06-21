import { DashiNode, Layout } from "dashi";

export class NestedLayout implements Layout {
  // TODO: Fix type errors for mixed children
  // TODO: Fix build error when importing not from dashi
  render(children: DashiNode): DashiNode {
    return (
      <div>
        <h2>Nested</h2>
        {children}
      </div>
    );
  }
}
