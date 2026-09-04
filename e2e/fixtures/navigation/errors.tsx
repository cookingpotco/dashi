import {
  type ErrorArgs,
  type FatalArgs,
  NavigationRoot,
  type NotFoundArgs,
} from "dashi";
import type { AppState } from "./state.ts";

export function NotFound({ html }: NotFoundArgs<AppState>) {
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

export function ErrorPage({ html }: ErrorArgs<AppState>) {
  return html(<p id="heading">error</p>);
}

export function fatal({ html }: FatalArgs) {
  return html(
    <html>
      <body>Something went wrong</body>
    </html>,
  );
}
