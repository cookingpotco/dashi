import { type Element, Layout } from "dashi";

export class NestedLayout implements Layout {
  render(_req: Request, children: Element): Element {
    return (
      <div>
        <h2>Nested</h2>
        {children}
      </div>
    );
  }
}
