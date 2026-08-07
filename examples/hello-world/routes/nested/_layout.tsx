import { DashiNode, Layout } from "dashi";

export class NestedLayout implements Layout {
  render(_req: Request, children: DashiNode): DashiNode {
    return (
      <div>
        <h2>Nested</h2>
        {children}
      </div>
    );
  }
}
