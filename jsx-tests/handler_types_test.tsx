import { serve } from "dashi";
import type { Element } from "dashi/jsx-runtime";

function typechecks() {
  serve(({ route }) => ({
    layouts: [
      ({ children }): Element => children,
    ],
    notFound: ({ html }) => html(<p>nope</p>),
    error: ({ html }) => html(<p>err</p>),
    routes: [
      route("/", {
        GET: ({ html }) => html(<p>ok</p>),
        POST: ({ patches }) => patches([]),
      }),
      route("/zero", {
        GET: () => new Response("ok"),
        POST: () => new Response("ok"),
      }),
      route("/bad-write", {
        // @ts-expect-error write args have patches, not html
        POST: ({ html }) => html(<p>nope</p>),
      }),
      route("/bad-read", {
        // @ts-expect-error read args have html, not patches
        GET: ({ patches }) => patches([]),
      }),
      route("/positional", {
        // @ts-expect-error positional (ctx, html) is not ReadArgs
        GET: (_ctx, html) => html(<p>nope</p>),
      }),
    ],
  }), { fatal: ({ html }) => html(<p>crash</p>) });

  serve(({ route }) => ({
    layouts: [
      () => {
        throw new Error("layout");
      },
    ],
    middleware: [
      () => {
        throw new Error("mw");
      },
    ],
    error: () => new Response("err"),
    notFound: () => new Response("miss"),
    routes: [
      route("/", { GET: () => new Response("ok") }),
    ],
  }), { fatal: () => new Response("crash") });

  serve(({ route }) => ({
    layouts: [
      // @ts-expect-error layouts return Element, not Response
      () => new Response("nope"),
    ],
    routes: [
      route("/", { GET: ({ html }) => html(<p>x</p>) }),
    ],
  }));
}

Deno.test("handler types typecheck", () => {
  void typechecks;
});
