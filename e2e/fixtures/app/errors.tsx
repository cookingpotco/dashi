import { type Html, type WrapperCtx } from "dashi";

export function ErrorPage(
  _ctx: WrapperCtx,
  _thrown: unknown,
  html: Html,
) {
  return html(<p id="frag-error">frag-error-ui</p>);
}

export function fatal(html: Html) {
  return html(
    <html>
      <body>
        <p id="fallback-chrome">crash-fallback</p>
      </body>
    </html>,
  );
}
