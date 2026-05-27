// @ts-types="saffron"
import { Layout, SaffronNode } from "saffron";

export class RootLayout implements Layout {
  render(children: SaffronNode): SaffronNode {
    return (
      <html>
        <h1>Website Title</h1>
        {children}
      </html>
    );
  }
}
