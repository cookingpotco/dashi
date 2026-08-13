import { Layout, TrustedHtml } from "dashi";

export class NestedLayout implements Layout {
  render(_req: Request, children: TrustedHtml): TrustedHtml {
    return (
      <div>
        <h2>Nested</h2>
        {children}
      </div>
    );
  }
}
