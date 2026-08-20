# Integration tests

These cases boot a real app in a subprocess, request a URL, and assert on the
response. Adding coverage should mean writing a case, not writing plumbing.

```sh
deno task test:int
```

`int-tests/` is a workspace member. Import the framework as `dashi`, the same
way `examples/` do.

## Add a case

If the fixture already has the route, append an `IntegrationTestCase` in that
fixture's `main_test.ts` and stop. If it needs a new path, add a `route()` leaf
in the fixture `main.ts` `group()` callback under the shared root wraps, or a
nested `group` when it needs extra wraps or a path prefix, and import the
handler. One request, several asserts: status, headers, then at most one of
`html` or `json`. `html` covers parsed DOM `select` plus raw `bodyIncludes` /
`bodyExcludes` (escaping, DOCTYPE, leftover `{{fragment:` markers). `json` is
the expected parsed object. Raw top-level `bodyIncludes` / `bodyExcludes` are
for responses that are neither (404, 405, empty 303). `runCase` parses HTML only
when `html` is set.

`runCase` executes that data. Flows that are not one request (cookies,
concurrent requests) use `boot` / `App.fetch` from `mod.ts` inside a `t.step`.
Sequential cases share the fixture process, so a POST can be followed by a GET
that observes it.

## Add a fixture app

`fixtures/app` is the main fixture: a flat folder of `*_route` / `*_layout` /
`*_middleware` modules plus `main.ts`, matching the examples. Put a new folder
next to it only when the behaviour cannot live on that app. Do not add a fixture
as its own workspace member. Extra fixtures (`cors`, `error-defaults`,
`error-fallback-response`) are a small `main.ts` or `main.tsx` because they
cannot share the main app's `serve()` table.

Each fixture calls
`serve(group(({ route, group }) => ({ … })), { port: 0,
errorFallback })`.
Shared wraps live on the root group or a nested `group`. `deno task test:int`
picks up every `*_test.ts` under `int-tests/`.
