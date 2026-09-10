import { type ErrorArgs, type FatalArgs } from "dashi";

export function ErrorPage({ thrown, html }: ErrorArgs) {
  const message = thrown instanceof Error ? thrown.message : "Unknown error";
  return html(<p id="error">{message}</p>);
}

export function fatal({ html }: FatalArgs) {
  return html(
    <html>
      <body>Something went wrong</body>
    </html>,
  );
}
