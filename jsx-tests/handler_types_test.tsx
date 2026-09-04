import { type Ctx, type SealHtml, type SealPatches, serve } from "dashi";
import type { Element } from "dashi/jsx-runtime";

function typechecks() {
  serve(({ route }) => ({
    layouts: [
      (_ctx, children): Element => children,
    ],
    notFound: (_ctx, html) => html(<p>nope</p>),
    error: (_ctx, _thrown, html) => html(<p>err</p>),
    routes: [
      route("/", {
        GET: (_ctx, html: SealHtml) => html(<p>ok</p>),
        POST: (_ctx, patches: SealPatches) => patches([]),
      }),
      route("/bad-write", {
        // @ts-expect-error write second arg is SealPatches, not SealHtml
        POST: (_ctx: Ctx, html: SealHtml) => html(<p>nope</p>),
      }),
    ],
  }), { fatal: (html) => html(<p>crash</p>) });

  serve(({ route }) => ({
    layouts: [
      // @ts-expect-error layouts return Element, not Response
      (_ctx, _children) => new Response("nope"),
    ],
    routes: [
      route("/", { GET: (_ctx, html) => html(<p>x</p>) }),
    ],
  }));
}

Deno.test("handler types typecheck", () => {
  void typechecks;
});
