import { cached, CacheStrategy, serve, status } from "dashi";
import type { Element } from "dashi/jsx-runtime";

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

  serve(({ route }) => ({
    layouts: [
      (_ctx, children): Element => {
        // @ts-expect-error layouts cannot return status()
        return status(404, children);
      },
    ],
    routes: [
      route("/", {
        GET: () => status(404, <p>nope</p>),
        // @ts-expect-error write handlers return patches or a Response
        POST: () => status(404, <p>nope</p>),
      }),
    ],
  }));
}

Deno.test("status types typecheck", () => {
  void typechecks;
});
