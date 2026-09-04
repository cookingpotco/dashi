import { type Html, type WrapperCtx } from "dashi";

export function ErrorPage(
  _ctx: WrapperCtx,
  _thrown: unknown,
  html: Html,
) {
  return html(<p id="heading">error</p>);
}

export function fatal(html: Html) {
  return html(
    <html>
      <body>Something went wrong</body>
    </html>,
  );
}
