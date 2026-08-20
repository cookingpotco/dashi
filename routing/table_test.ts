import { assertEquals, assertThrows } from "@std/assert";
import { type Element } from "../jsx-runtime/mod.ts";
import { type Ctx, type Middleware } from "../shared/mod.ts";
import { compile, group, match, type ParamsOf, route } from "./table.ts";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

const noop = () => "" as Element;
const get = { GET: noop };

function typechecks() {
  type _required = Expect<Equal<ParamsOf<"/posts/:id">, { id: string }>>;
  type _multi = Expect<
    Equal<ParamsOf<"/a/:b/c/:d">, { b: string; d: string }>
  >;
  type _optional = Expect<Equal<ParamsOf<"/posts/:id?">, { id?: string }>>;
  type _catchall = Expect<Equal<ParamsOf<"/files/:path*">, { path: string }>>;
  type _root = Expect<Equal<ParamsOf<"/">, Record<string, never>>>;
  type _static = Expect<Equal<ParamsOf<"/posts/new">, Record<string, never>>>;

  interface User {
    name: string;
  }
  interface AppState {
    user: User;
  }
  type _stateUser = Expect<
    Equal<
      Ctx<Record<string, never>, AppState>["state"]["user"],
      User | undefined
    >
  >;

  route("/", { GET: noop });
  // @ts-expect-error HEAD is not a declared handler; GET answers it
  route("/", { HEAD: noop });
  // @ts-expect-error OPTIONS is not a declared handler; the router answers it
  route("/", { OPTIONS: noop });
  route("/posts/:id", {
    GET: (ctx) => {
      ctx.params.id;
      // @ts-expect-error only declared params exist
      ctx.params.slug;
      return "" as Element;
    },
  });

  // @ts-expect-error trailing slash is rejected
  route("/nested/", get);
  // @ts-expect-error optional only as the last segment
  route("/a/:b?/c", get);
  // @ts-expect-error catch-all only as the last segment
  route("/a/:b*/c", get);
  // @ts-expect-error param names cannot start with a digit
  route("/posts/:1id", get);
  // @ts-expect-error param names cannot contain a hyphen
  route("/posts/:id-x", get);
  // @ts-expect-error duplicate param names
  route("/a/:id/b/:id", get);
  // @ts-expect-error catch-all must be named
  route("/files/*", get);
  // @ts-expect-error wraps belong on group(), not route()
  route("/", { GET: noop }, { layouts: [] });
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

  const compiled = compile({
    routes: [
      route("/posts/:path*", { GET: postsRest }),
      route("/posts/:id", { GET: postsId }),
      route("/posts/new", { GET: postsNew }),
      route("/opt/:id?", { GET: optional }),
      route("/files/:path*", { GET: files }),
      route("/tie/:id", { GET: firstTie }),
      route("/other/:id", { GET: secondTie }),
    ],
  });

  const postsNewMatch = match(compiled, "/posts/new");
  assertEquals(postsNewMatch?.handlers.GET, postsNew);
  assertEquals(postsNewMatch?.params, {});

  const postsIdMatch = match(compiled, "/posts/abc");
  assertEquals(postsIdMatch?.handlers.GET, postsId);
  assertEquals(postsIdMatch?.params, { id: "abc" });

  const postsRestMatch = match(compiled, "/posts/a/b");
  assertEquals(postsRestMatch?.handlers.GET, postsRest);
  assertEquals(postsRestMatch?.params, { path: "a/b" });

  assertEquals(match(compiled, "/opt")?.params, {});
  assertEquals(match(compiled, "/opt/x")?.params, { id: "x" });

  assertEquals(match(compiled, "/files")?.params, { path: "" });
  assertEquals(match(compiled, "/files/a/b")?.params, { path: "a/b" });

  assertEquals(match(compiled, "/tie/1")?.handlers.GET, firstTie);
  assertEquals(match(compiled, "/other/1")?.handlers.GET, secondTie);
  assertEquals(match(compiled, "/tie/1")?.params, { id: "1" });
  assertEquals(match(compiled, "/posts/new/")?.handlers.GET, postsRest);
  assertEquals(match(compiled, "/nope"), null);
});

Deno.test("compile rejects duplicate and invalid paths", () => {
  assertThrows(
    () =>
      compile({
        routes: [
          route("/posts/:id", { GET: noop }),
          route("/posts/:slug", { GET: noop }),
        ],
      }),
    Error,
    "Duplicate or unreachable route",
  );
  assertThrows(
    () =>
      compile({
        routes: [route("/", { GET: noop }), route("/:id?", { GET: noop })],
      }),
    Error,
    "Duplicate or unreachable route",
  );
  assertThrows(
    () => compile({ routes: [route("/a/:b?/c" as never, { GET: noop })] }),
    Error,
    "Optional and catch-all are only allowed as the last segment",
  );
  assertThrows(
    () => compile({ routes: [route("/a/:b*/c" as never, { GET: noop })] }),
    Error,
    "Optional and catch-all are only allowed as the last segment",
  );
  assertThrows(
    () => compile({ routes: [route("/nested/" as never, { GET: noop })] }),
    Error,
    `No trailing slash except "/"`,
  );
  assertThrows(
    () => compile({ routes: [route("/posts/:1id" as never, { GET: noop })] }),
    Error,
    "Invalid param name",
  );
  assertThrows(
    () => compile({ routes: [route("/posts/:id-x" as never, { GET: noop })] }),
    Error,
    "Invalid param name",
  );
  assertThrows(
    () => compile({ routes: [route("/a/:id/b/:id" as never, { GET: noop })] }),
    Error,
    "Duplicate param name",
  );
  assertThrows(
    () => compile({ routes: [route("/files/*" as never, { GET: noop })] }),
    Error,
    "Catch-all must be named",
  );
});

Deno.test("compile inherits wraps outermost-first and preserves declaration order", () => {
  const rootLayout = () => "" as Element;
  const nestedLayout = () => "" as Element;
  const rootMw: Middleware = (_ctx, next) => next();
  const nestedMw: Middleware = (_ctx, next) => next();
  const home = () => "" as Element;
  const nested = () => "" as Element;
  const secret = () => "" as Element;
  const postsNew = () => "" as Element;
  const postsId = () => "" as Element;

  const compiled = compile({
    layouts: [rootLayout],
    middleware: [rootMw],
    routes: [
      route("/", { GET: home }),
      group({
        layouts: [nestedLayout],
        middleware: [nestedMw],
        routes: [route("/nested", { GET: nested })],
      }),
      route("/secret", { GET: secret }),
      route("/posts/new", { GET: postsNew }),
      route("/posts/:id", { GET: postsId }),
    ],
  });

  const declaredPaths = [
    ...compiled.staticByPath.values(),
    ...compiled.dynamic,
  ]
    .sort((a, b) => a.declarationIndex - b.declarationIndex)
    .map((r) => r.path)
    .filter((path, i, paths) => paths.indexOf(path) === i);
  assertEquals(declaredPaths, [
    "/",
    "/nested",
    "/secret",
    "/posts/new",
    "/posts/:id",
  ]);

  const homeMatch = match(compiled, "/");
  assertEquals(homeMatch?.handlers.GET, home);
  assertEquals(homeMatch?.middleware, [rootMw]);
  assertEquals(homeMatch?.boundary, compiled.rootBoundary);
  assertEquals(homeMatch?.boundary?.layouts, [rootLayout]);
  assertEquals(homeMatch?.boundary?.parent, undefined);

  const nestedMatch = match(compiled, "/nested");
  assertEquals(nestedMatch?.handlers.GET, nested);
  assertEquals(nestedMatch?.middleware, [rootMw, nestedMw]);
  assertEquals(nestedMatch?.boundary?.layouts, [nestedLayout]);
  assertEquals(nestedMatch?.boundary?.parent, compiled.rootBoundary);
  assertEquals(nestedMatch?.boundary?.parent?.layouts, [rootLayout]);
  assertEquals(nestedMatch?.boundary?.parent?.parent, undefined);

  const secretMatch = match(compiled, "/secret");
  assertEquals(secretMatch?.handlers.GET, secret);
  assertEquals(secretMatch?.middleware, [rootMw]);
  assertEquals(secretMatch?.boundary, compiled.rootBoundary);

  assertEquals(match(compiled, "/posts/new")?.handlers.GET, postsNew);
  assertEquals(match(compiled, "/posts/abc")?.handlers.GET, postsId);
  assertEquals(match(compiled, "/posts/abc")?.params, { id: "abc" });
});

Deno.test("compile keeps per-group error on the boundary chain", () => {
  const rootError = () => "" as Element;
  const nestedError = () => "" as Element;
  const page = () => "" as Element;

  const compiled = compile({
    error: rootError,
    routes: [
      group({
        error: nestedError,
        routes: [route("/x", { GET: page })],
      }),
    ],
  });
  const matched = match(compiled, "/x");
  assertEquals(matched?.boundary?.error, nestedError);
  assertEquals(matched?.boundary?.parent, compiled.rootBoundary);
  assertEquals(matched?.boundary?.parent?.error, rootError);
  assertEquals(matched?.boundary?.parent?.parent, undefined);
});

Deno.test("GET+POST share one path; empty map throws", () => {
  const list = () => "" as Element;
  const add = () => "" as Element;
  const compiled = compile({
    routes: [
      route("/guestbook", { GET: list, POST: add }),
    ],
  });
  const matched = match(compiled, "/guestbook");
  assertEquals(matched?.handlers.GET, list);
  assertEquals(matched?.handlers.POST, add);

  assertThrows(
    () => route("/", {}),
    Error,
    "has no method handlers",
  );
});
