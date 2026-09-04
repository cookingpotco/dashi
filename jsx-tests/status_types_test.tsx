import { cached, CacheStrategy, patch, serve, status } from "dashi";
import type { Element } from "dashi/jsx-runtime";

function typechecks() {
  status(404, <p>x</p>);
  status(
    404,
    cached(<p>x</p>, { strategy: CacheStrategy.NoStore }),
  );
  status(400, [patch.replace("#x", <p>err</p>)]);

  // @ts-expect-error cached() takes Element, not StatusElement
  cached(status(404, <p>x</p>), { strategy: CacheStrategy.NoStore });

  // @ts-expect-error status() is not a JSX child
  <div>{status(404, <p>x</p>)}</div>;

  // @ts-expect-error status() patches are not a JSX child
  <div>{status(400, [patch.replace("#x", <p>err</p>)])}</div>;

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
        POST: () => status(400, [patch.replace("#x", <p>err</p>)]),
      }),
      route("/bad-write", {
        // @ts-expect-error write handlers return patches or a Response
        POST: () => status(404, <p>nope</p>),
      }),
      route("/bad-get", {
        // @ts-expect-error GET cannot return status patches
        GET: () => status(400, [patch.replace("#x", <p>err</p>)]),
      }),
    ],
  }));
}

Deno.test("status types typecheck", () => {
  void typechecks;
});
