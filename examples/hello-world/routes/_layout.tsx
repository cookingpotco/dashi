import { type Element, Layout } from "dashi";

export class RootLayout implements Layout {
  render(_req: Request, children: Element): Element {
    return (
      <html>
        <h1>Website Title</h1>
        {children}
      </html>
    );
  }
}
