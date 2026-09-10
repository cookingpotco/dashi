import { type ErrorArgs, type FatalArgs } from "dashi";

export function ErrorPage({ html }: ErrorArgs) {
  return html(<p id="slot-error">slot-error-ui</p>);
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
