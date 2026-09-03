import {
  cached,
  CacheStrategy,
  type Ctx,
  serve,
  status,
  type WrapperCtx,
} from "dashi";
import type { Element } from "dashi/jsx-runtime";

type State = {
  token: string;
};

function typechecks() {
  status(404, <p>x</p>);
  status(
    404,
    cached(<p>x</p>, { strategy: CacheStrategy.NoStore }),
  );

  // @ts-expect-error cached() takes Element, not StatusElement
  cached(status(404, <p>x</p>), { strategy: CacheStrategy.NoStore });

  // @ts-expect-error status() is not a JSX child
  <div>{status(404, <p>x</p>)}</div>;

  serve<State>(({ route }) => ({
    layouts: [
      (ctx, children) => {
        // @ts-expect-error layouts cannot assign to state
        ctx.state.token = "x";
        return children;
      },
    ],
    middleware: [
      (ctx, next) => {
        ctx.state.token = "mw";
        return next();
      },
    ],
    error: (ctx: WrapperCtx<State>, _thrown) => {
      ctx.state.token = "err";
      return <p>err</p>;
    },
    notFound: (ctx: Ctx<Record<string, string>, State>) => {
      ctx.state.token = "miss";
      return <p>miss</p>;
    },
    routes: [
      route("/", {
        GET: (ctx) => {
          ctx.state.token = "ok";
          return status(404, <p>nope</p>);
        },
        // @ts-expect-error write handlers return patches or a Response
        POST: () => status(404, <p>nope</p>),
      }),
    ],
  }));

  serve(({ route }) => ({
    layouts: [
      (_ctx, children): Element => {
        // @ts-expect-error layouts cannot return status()
        return status(404, children);
      },
    ],
    routes: [route("/", { GET: () => <p>ok</p> })],
  }));
}

Deno.test("status and layout types typecheck", () => {
  void typechecks;
});
