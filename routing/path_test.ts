import { assertEquals, assertThrows } from "@std/assert";
import { type Element } from "../jsx-runtime/jsx_types.ts";
import { type Ctx, type Middleware } from "../shared/shared_types.ts";
import {
  compile,
  flatten,
  group,
  match,
  type ParamsOf,
  route,
} from "./path.ts";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

const noop = () => "" as Element;

function typechecks() {
  type _required = Expect<Equal<ParamsOf<"/posts/:id">, { id: string }>>;
  type _multi = Expect<
    Equal<ParamsOf<"/a/:b/c/:d">, { b: string; d: string }>
  >;
  type _optional = Expect<Equal<ParamsOf<"/posts/:id?">, { id?: string }>>;
  type _catchall = Expect<Equal<ParamsOf<"/files/:path*">, { path: string }>>;
  type _root = Expect<Equal<ParamsOf<"/">, Record<string, never>>>;
  type _static = Expect<Equal<ParamsOf<"/posts/new">, Record<string, never>>>;

  type User = { name: string };
  type AppState = { user: User };
  type _stateUser = Expect<
    Equal<
      Ctx<Record<string, never>, AppState>["state"]["user"],
      User | undefined
    >
  >;

  route("/", noop);
  route("/posts/:id", (ctx) => {
    ctx.params.id;
    // @ts-expect-error only declared params exist
    ctx.params.slug;
    return "" as Element;
  });

  // @ts-expect-error trailing slash is rejected
  route("/nested/", noop);
  // @ts-expect-error optional only as the last segment
  route("/a/:b?/c", noop);
  // @ts-expect-error catch-all only as the last segment
  route("/a/:b*/c", noop);
  // @ts-expect-error param names cannot start with a digit
  route("/posts/:1id", noop);
  // @ts-expect-error param names cannot contain a hyphen
  route("/posts/:id-x", noop);
  // @ts-expect-error duplicate param names
  route("/a/:id/b/:id", noop);
  // @ts-expect-error catch-all must be named
  route("/files/*", noop);
  // @ts-expect-error wraps belong on group(), not route()
  route("/", noop, { layouts: [] });
}

Deno.test("ParamsOf infers params from path literals", () => {
  void typechecks;
});

Deno.test("match ranks routes and extracts params", () => {
  const postsNew = () => "" as Element;
  const postsId = () => "" as Element;
  const postsRest = () => "" as Element;
  const optional = () => "" as Element;
  const files = () => "" as Element;
  const firstTie = () => "" as Element;
  const secondTie = () => "" as Element;

  const compiled = compile([
    route("/posts/:path*", postsRest),
    route("/posts/:id", postsId),
    route("/posts/new", postsNew),
    route("/opt/:id?", optional),
    route("/files/:path*", files),
    route("/tie/:id", firstTie),
    route("/other/:id", secondTie),
  ]);

  const postsNewMatch = match(compiled, "/posts/new");
  assertEquals(postsNewMatch?.handler, postsNew);
  assertEquals(postsNewMatch?.params, {});

  const postsIdMatch = match(compiled, "/posts/abc");
  assertEquals(postsIdMatch?.handler, postsId);
  assertEquals(postsIdMatch?.params, { id: "abc" });

  const postsRestMatch = match(compiled, "/posts/a/b");
  assertEquals(postsRestMatch?.handler, postsRest);
  assertEquals(postsRestMatch?.params, { path: "a/b" });

  assertEquals(match(compiled, "/opt")?.params, {});
  assertEquals(match(compiled, "/opt/x")?.params, { id: "x" });

  assertEquals(match(compiled, "/files")?.params, { path: "" });
  assertEquals(match(compiled, "/files/a/b")?.params, { path: "a/b" });

  assertEquals(match(compiled, "/tie/1")?.handler, firstTie);
  assertEquals(match(compiled, "/other/1")?.handler, secondTie);
  assertEquals(match(compiled, "/tie/1")?.params, { id: "1" });
  assertEquals(match(compiled, "/posts/new/")?.handler, postsRest);
  assertEquals(match(compiled, "/nope"), null);
});

Deno.test("compile rejects duplicate and invalid paths", () => {
  assertThrows(
    () => compile([route("/posts/:id", noop), route("/posts/:slug", noop)]),
    Error,
    "Duplicate or unreachable route",
  );
  assertThrows(
    () => compile([route("/", noop), route("/:id?", noop)]),
    Error,
    "Duplicate or unreachable route",
  );
  assertThrows(
    () => compile([route("/a/:b?/c" as never, noop)]),
    Error,
    "Optional and catch-all are only allowed as the last segment",
  );
  assertThrows(
    () => compile([route("/a/:b*/c" as never, noop)]),
    Error,
    "Optional and catch-all are only allowed as the last segment",
  );
  assertThrows(
    () => compile([route("/nested/" as never, noop)]),
    Error,
    `No trailing slash except "/"`,
  );
  assertThrows(
    () => compile([route("/posts/:1id" as never, noop)]),
    Error,
    "Invalid param name",
  );
  assertThrows(
    () => compile([route("/posts/:id-x" as never, noop)]),
    Error,
    "Invalid param name",
  );
  assertThrows(
    () => compile([route("/a/:id/b/:id" as never, noop)]),
    Error,
    "Duplicate param name",
  );
  assertThrows(
    () => compile([route("/files/*" as never, noop)]),
    Error,
    "Catch-all must be named",
  );
});

Deno.test("flatten inherits wraps outermost-first and preserves declaration order", () => {
  const rootLayout = () => "" as Element;
  const nestedLayout = () => "" as Element;
  const rootMw: Middleware = (_ctx, next) => next();
  const nestedMw: Middleware = (_ctx, next) => next();
  const home = () => "" as Element;
  const nested = () => "" as Element;
  const secret = () => "" as Element;
  const postsNew = () => "" as Element;
  const postsId = () => "" as Element;

  const routes = flatten({
    layouts: [rootLayout],
    middleware: [rootMw],
    routes: [
      route("/", home),
      group({
        layouts: [nestedLayout],
        middleware: [nestedMw],
        routes: [route("/nested", nested)],
      }),
      route("/secret", secret),
      route("/posts/new", postsNew),
      route("/posts/:id", postsId),
    ],
  });

  assertEquals(routes.map((r) => r.path), [
    "/",
    "/nested",
    "/secret",
    "/posts/new",
    "/posts/:id",
  ]);

  const compiled = compile(routes);

  const homeMatch = match(compiled, "/");
  assertEquals(homeMatch?.handler, home);
  assertEquals(homeMatch?.layouts, [rootLayout]);
  assertEquals(homeMatch?.middleware, [rootMw]);

  const nestedMatch = match(compiled, "/nested");
  assertEquals(nestedMatch?.handler, nested);
  assertEquals(nestedMatch?.layouts, [rootLayout, nestedLayout]);
  assertEquals(nestedMatch?.middleware, [rootMw, nestedMw]);

  const secretMatch = match(compiled, "/secret");
  assertEquals(secretMatch?.handler, secret);
  assertEquals(secretMatch?.layouts, [rootLayout]);
  assertEquals(secretMatch?.middleware, [rootMw]);

  assertEquals(match(compiled, "/posts/new")?.handler, postsNew);
  assertEquals(match(compiled, "/posts/abc")?.handler, postsId);
  assertEquals(match(compiled, "/posts/abc")?.params, { id: "abc" });
});
