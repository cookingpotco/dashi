import { type Element } from "dashi";

export default function RootLayout(req: Request, children: Element): Element {
  return (
    <html>
      <h1>Website Title</h1>
      <p id="pre">{req.headers.get("x-pre")}</p>
      {children}
    </html>
  );
}
