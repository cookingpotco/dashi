import { serve, type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

async function logger(_ctx: WrapperCtx, next: () => Promise<Response>) {
  const res = await next();
  res.headers.set("x-mw", "ok");
  return res;
}

function rootLayout(ctx: WrapperCtx, children: Element): Element {
  if (ctx.url.pathname === "/root-layout-throws") {
    throw new Error("root-layout");
  }
  return (
    <html>
      <h1>Defaults</h1>
      {children}
    </html>
  );
}

function home(): Element {
  return <p id="home">home</p>;
}

function boom(): Element {
  throw new Error("handler-boom");
}

function okPage(): Element {
  return <p id="ok-page">ok</p>;
}

export function start() {
  return serve(({ route }) => ({
    layouts: [rootLayout],
    middleware: [logger],
    routes: [
      route("/", { GET: home }),
      route("/throw", { GET: boom }),
      route("/root-layout-throws", { GET: okPage }),
    ],
  }), { hostname: "127.0.0.1", port: 0 });
}
