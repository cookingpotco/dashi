import { type Html, type WrapperCtx } from "dashi";

export function ErrorPage(
  _ctx: WrapperCtx,
  thrown: unknown,
  html: Html,
) {
  const message = thrown instanceof Error ? thrown.message : "Unknown error";
  return html(<p id="error">{message}</p>);
}

export function fatal(html: Html) {
  return html(
    <html>
      <body>Something went wrong</body>
    </html>,
  );
}
