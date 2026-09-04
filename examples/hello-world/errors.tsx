import { type Ctx, type SealHtml, type WrapperCtx } from "dashi";

export function NotFound(_ctx: Ctx<Record<string, string>>, html: SealHtml) {
  return html(
    <p id="not-found">
      Page not found
    </p>,
  );
}

export function ErrorPage(
  _ctx: WrapperCtx,
  thrown: unknown,
  html: SealHtml,
) {
  const message = thrown instanceof Error ? thrown.message : "Unknown error";
  return html(
    <p id="error">
      {message}
    </p>,
  );
}

export function fatal(html: SealHtml) {
  return html(
    <html>
      <body>Something went wrong</body>
    </html>,
  );
}
