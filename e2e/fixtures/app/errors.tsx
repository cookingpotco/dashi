import { type ErrorArgs, type FatalArgs } from "dashi";

export function ErrorPage({ html }: ErrorArgs) {
  return html(<p id="frag-error">frag-error-ui</p>);
}

export function fatal({ html }: FatalArgs) {
  return html(
    <html>
      <body>
        <p id="fallback-chrome">crash-fallback</p>
      </body>
    </html>,
  );
}
