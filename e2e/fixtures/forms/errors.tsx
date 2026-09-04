import { type ErrorArgs, type FatalArgs } from "dashi";

export function ErrorPage({ html }: ErrorArgs) {
  return html(<p id="heading">error</p>);
}

export function fatal({ html }: FatalArgs) {
  return html(
    <html>
      <body>Something went wrong</body>
    </html>,
  );
}
