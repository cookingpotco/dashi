import { type LayoutArgs, NavigationRoot } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "./state.ts";

export function RootLayout({ ctx, children }: LayoutArgs<AppState>): Element {
  return (
    <html>
      <head>
        <title>{ctx.state.title ?? "nav"}</title>
        {ctx.state.stylesheet
          ? <link rel="stylesheet" href={ctx.state.stylesheet} />
          : null}
      </head>
      <header id="persistent">persistent</header>
      <NavigationRoot>
        {children}
      </NavigationRoot>
    </html>
  );
}
