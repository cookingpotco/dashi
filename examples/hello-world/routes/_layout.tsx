import { DashiNode, Layout } from "dashi";

export class RootLayout implements Layout {
  render(children: DashiNode): DashiNode {
    return (
      <html>
        <h1>Website Title</h1>
        {children}
      </html>
    );
  }
}
