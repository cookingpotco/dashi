import type { Element } from "dashi/jsx-runtime";

export function ErrorPage(): Element {
  return <p id="heading">error</p>;
}

export const fatal = (
  <html>
    <body>Something went wrong</body>
  </html>
);
