// @ts-types="saffron"
import { Layout, SaffronNode } from "saffron";

export class NestedLayout implements Layout {
  // TODO: Fix type errors for mixed children
  // TODO: Fix build error when importing not from saffron
  render(children: SaffronNode): SaffronNode {
    return (
      <div>
        <h2>Nested</h2>
        {children}
      </div>
    );
  }
}
