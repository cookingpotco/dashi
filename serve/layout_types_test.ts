import { serve } from "./mod.ts";

type State = {
  token: string;
};

function typechecks() {
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
    error: (ctx, _thrown) => {
      ctx.state.token = "err";
      return new Response("err");
    },
    notFound: (ctx) => {
      ctx.state.token = "miss";
      return new Response("miss");
    },
    routes: [
      route("/", {
        GET: (ctx) => {
          ctx.state.token = "ok";
          return new Response("ok");
        },
      }),
    ],
  }));
}

Deno.test("layout state is readonly", () => {
  void typechecks;
});
