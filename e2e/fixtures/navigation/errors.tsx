import {
  type Ctx,
  NavigationRoot,
  type SealHtml,
  type WrapperCtx,
} from "dashi";
import type { AppState } from "./state.ts";

export function NotFound(
  _ctx: Ctx<Record<string, string>, AppState>,
  html: SealHtml,
) {
  return html(
    <html>
      <head>
        <title>not found</title>
      </head>
      <header id="persistent">persistent</header>
      <NavigationRoot>
        <p id="heading">not found</p>
      </NavigationRoot>
    </html>,
  );
}

export function ErrorPage(
  _ctx: WrapperCtx<AppState>,
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
