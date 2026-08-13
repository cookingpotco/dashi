import { Layout, TrustedHtml } from "dashi";

export class RootLayout implements Layout {
  render(_req: Request, children: TrustedHtml): TrustedHtml {
    return (
      <html>
        <h1>Website Title</h1>
        {children}
      </html>
    );
  }
}
