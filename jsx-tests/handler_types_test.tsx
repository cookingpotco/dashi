import {
  type LayoutArgs,
  type MiddlewareArgs,
  type ReadArgs,
  serve,
  type WriteArgs,
} from "dashi";
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

  type AppState = { token: string };
  type Other = { n: number };
  type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2) ? true : false;
  type Expect<T extends true> = T;
  type _stateOnly = Expect<
    Equal<
      ReadArgs<{ state: AppState }>["ctx"]["state"]["token"],
      string | undefined
    >
  >;
  type _paramsOnly = Expect<
    Equal<ReadArgs<{ params: { id: string } }>["ctx"]["params"]["id"], string>
  >;
  type _paramsOnlyWideState = Expect<
    Equal<
      ReadArgs<{ params: { id: string } }>["ctx"]["state"],
      Partial<Record<string, unknown>>
    >
  >;
  // @ts-expect-error bag accepts only state and params
  type _notABag = ReadArgs<{ id: string }>;
  // @ts-expect-error raw state is not a bag
  type _rawState = ReadArgs<AppState>;

  function noState({ html }: ReadArgs) {
    return html(<p>ok</p>);
  }
  function noStateWrite({ patches }: WriteArgs) {
    return patches([]);
  }
  function layout({ children }: LayoutArgs) {
    return children;
  }
  function mw({ next }: MiddlewareArgs) {
    return next();
  }
  function withState({ ctx, html }: ReadArgs<{ state: AppState }>) {
    ctx.state.token;
    return html(<p>ok</p>);
  }
  function withBoth(
    { ctx, html }: ReadArgs<{ state: AppState; params: { id: string } }>,
  ) {
    ctx.params.id;
    ctx.state.token;
    return html(<p>ok</p>);
  }
  function withParams({ ctx }: ReadArgs<{ params: { id: string } }>) {
    ctx.params.id;
    return new Response();
  }
  function other({ html }: ReadArgs<{ state: Other }>) {
    return html(<p>nope</p>);
  }

  serve<AppState>(({ route }) => ({
    layouts: [layout],
    middleware: [mw],
    routes: [
      route("/", { GET: noState, POST: noStateWrite }),
      route("/s", { GET: withState }),
      route("/:id", { GET: withBoth }),
      route("/p/:id", { GET: withParams }),
      // @ts-expect-error wrong state
      route("/o", { GET: other }),
    ],
  }));
}

Deno.test("handler types typecheck", () => {
  void typechecks;
});
