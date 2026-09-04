import { type LayoutArgs, type ReadArgs, serve } from "dashi";
import type { Element } from "dashi/jsx-runtime";

function rootLayout({ ctx, children }: LayoutArgs): Element {
  if (ctx.url.pathname === "/root-layout-throws") {
    throw new Error("root-layout");
  }
  return (
    <html>
      <h1>Fallback response</h1>
      {children}
    </html>
  );
}

function home({ html }: ReadArgs) {
  return html(<p id="home">home</p>);
}

function okPage({ html }: ReadArgs) {
  return html(<p id="ok-page">ok</p>);
}

export function start() {
  return serve(({ route }) => ({
    layouts: [rootLayout],
    routes: [
      route("/", { GET: home }),
      route("/root-layout-throws", { GET: okPage }),
    ],
  }), {
    fatal: () =>
      new Response("fallback-response", {
        status: 500,
        headers: { "x-fallback": "1" },
      }),
    hostname: "127.0.0.1",
    port: 0,
  });
}
