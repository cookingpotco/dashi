import { type SealHtml, type WrapperCtx } from "dashi";

export function ErrorPage(
  _ctx: WrapperCtx,
  _thrown: unknown,
  html: SealHtml,
) {
  return html(<p id="heading">error</p>);
}

export function fatal(html: SealHtml) {
  return html(
    <html>
      <body>Something went wrong</body>
    </html>,
  );
}
