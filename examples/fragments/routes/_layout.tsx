import { type Element } from "dashi";

export default function RootLayout(
  _req: Request,
  children: Element,
): Element {
  return (
    <html>
      <h1>Website Title</h1>
      {children}
    </html>
  );
}
