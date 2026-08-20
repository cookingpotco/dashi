import { assertEquals, assertThrows } from "@std/assert";
import { type Element } from "../jsx-runtime/mod.ts";
import {
  type GroupPrefixError,
  type Join,
  type ParamsOf,
} from "./path_types.ts";
import { compile, group, joinPath, match } from "./table.ts";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

const noop = () => "" as Element;
const get = { GET: noop };

function typechecks() {
  type _joinNested = Expect<
    Equal<Join<"/users/:id", "/update/:field">, "/users/:id/update/:field">
  >;
  type _joinIndex = Expect<Equal<Join<"/users", "/">, "/users">>;
  type _joinRoot = Expect<Equal<Join<"/", "/nested">, "/nested">>;
  type _joinEmpty = Expect<Equal<Join<"", "/nested">, "/nested">>;
  type _joinBothRoot = Expect<Equal<Join<"", "/">, "/">>;
  type _joinedParams = Expect<
    Equal<
      ParamsOf<Join<"/users/:id", "/update/:field">>,
      { id: string; field: string }
    >
  >;
  type _optionalPrefix = Expect<
    Equal<
      GroupPrefixError<"/opt/:id?">,
      "Invalid group prefix: optional and catch-all are not allowed"
    >
  >;
  type _catchallPrefix = Expect<
    Equal<
      GroupPrefixError<"/files/:path*">,
      "Invalid group prefix: optional and catch-all are not allowed"
    >
  >;
  type _okPrefix = Expect<Equal<GroupPrefixError<"/users/:id">, never>>;

  group("/users/:id", ({ route }) => ({
    routes: [
      route("/update/:field", {
        POST: (ctx) => {
          ctx.params.id;
          ctx.params.field;
          // @ts-expect-error only declared params exist
          ctx.params.slug;
          return "" as Element;
        },
      }),
    ],
  }));

  group("/users/:id", ({ group }) => ({
    routes: [
      group("/posts/:postId", ({ route }) => ({
        routes: [
          route("/edit", {
            GET: (ctx) => {
              ctx.params.id;
              ctx.params.postId;
              return "" as Element;
            },
          }),
        ],
      })),
    ],
  }));

  group("/users/:id", ({ route }) => {
    // @ts-expect-error duplicate param names across the join
    route("/:id", get);
    return { routes: [] };
  });

  // @ts-expect-error optional cannot end a group prefix
  group("/opt/:id?", (_bag) => ({ routes: [] }));

  // @ts-expect-error catch-all cannot end a group prefix
  group("/files/:path*", (_bag) => ({ routes: [] }));
}

Deno.test("Join and joinPath compose prefix and child", () => {
  void typechecks;
  assertEquals(joinPath("", "/nested"), "/nested");
  assertEquals(joinPath("/", "/nested"), "/nested");
  assertEquals(joinPath("/users", "/"), "/users");
  assertEquals(
    joinPath("/users/:id", "/update/:field"),
    "/users/:id/update/:field",
  );
  assertEquals(joinPath("", "/"), "/");
  assertEquals(joinPath("/users", ""), "/users");
});

Deno.test("compile joins params across a group prefix", () => {
  const update = () => "" as Element;
  const compiled = compile(group("/users/:id", ({ route }) => ({
    routes: [route("/update/:field", { POST: update })],
  })));
  const matched = match(compiled, "/users/abc/update/email");
  assertEquals(matched?.handlers.POST, update);
  assertEquals(matched?.params, { id: "abc", field: "email" });
});

Deno.test("compile rejects duplicate names and illegal prefixes across the join", () => {
  assertThrows(
    () =>
      compile(group("/users/:id", ({ route }) => ({
        routes: [route("/:id" as never, { GET: noop })],
      }))),
    Error,
    "Duplicate param name",
  );
  assertThrows(
    () =>
      compile(group("/opt/:id?" as never, ({ route }) => ({
        routes: [route("/x", { GET: noop })],
      }))),
    Error,
    "Group prefix cannot end in optional or catch-all",
  );
  assertThrows(
    () =>
      compile(group("/files/:path*" as never, ({ route }) => ({
        routes: [route("/x", { GET: noop })],
      }))),
    Error,
    "Group prefix cannot end in optional or catch-all",
  );
});

Deno.test("compile remounts a pre-built group under the parent prefix", () => {
  const update = () => "" as Element;
  const users = group("/users/:id", ({ route }) => ({
    routes: [route("/update/:field", { POST: update })],
  }));
  const compiled = compile(group("/admin", (_bag) => ({
    routes: [users],
  })));
  const matched = match(compiled, "/admin/users/abc/update/email");
  assertEquals(matched?.handlers.POST, update);
  assertEquals(matched?.params, { id: "abc", field: "email" });
  assertEquals(match(compiled, "/users/abc/update/email"), null);
});
