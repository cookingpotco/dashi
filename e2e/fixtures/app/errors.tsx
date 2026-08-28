import { type Element } from "dashi";

export function ErrorPage(): Element {
  return <p id="frag-error">frag-error-ui</p>;
}

export const fatal = (
  <html>
    <body>
      <p id="fallback-chrome">crash-fallback</p>
    </body>
  </html>
);
