import { type Element } from "dashi";

export function ErrorPage(): Element {
  return <p id="heading">error</p>;
}

export const errorFallback = (
  <html>
    <body>Something went wrong</body>
  </html>
);
