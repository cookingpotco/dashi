import { type Element, serve, type WrapperCtx } from "dashi";

function rootLayout(ctx: WrapperCtx, children: Element): Element {
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

function home(): Element {
  return <p id="home">home</p>;
}

function okPage(): Element {
  return <p id="ok-page">ok</p>;
}

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [rootLayout],
    routes: [
      route("/", { GET: home }),
      route("/root-layout-throws", { GET: okPage }),
    ],
  }), {
    errorFallback: new Response("fallback-response", {
      status: 500,
      headers: { "x-fallback": "1" },
    }),
    port: 0,
  });
}
