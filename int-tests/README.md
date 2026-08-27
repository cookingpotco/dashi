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
on the root group in `mod.ts` under the shared root wraps, or a feature folder
that exports a `Group` when it needs extra wraps or a path prefix, and import
that `Group` into the root callback. One request, several asserts: status,
headers, then at most one of `html` or `json`. `html` covers parsed DOM `select`
plus raw `bodyIncludes` / `bodyExcludes` (escaping, DOCTYPE, leftover
`{{fragment:` markers). `json` is the expected parsed object. Raw top-level
`bodyIncludes` / `bodyExcludes` are for responses that are neither (404, 405,
empty 303). `runCase` parses HTML only when `html` is set.

`runCase` executes that data. Flows that are not one request (cookies,
concurrent requests) use `boot` / `App.fetch` from `mod.ts` inside a `t.step`.
Sequential cases share the fixture process, so a POST can be followed by a GET
that observes it.

## Add a fixture app

`fixtures/app` is the main fixture: root `mod.ts` is the `serve()` callback,
`main.ts` boots it, and every `group()` lives in a feature folder that exports
that `Group`. Probe `route()`s stay on the root. Put a new folder next to it
only when the behaviour cannot live on that app. Do not add a fixture as its own
workspace member. Extra fixtures (`cors`, `error-defaults`,
`error-fallback-response`, `fragment-depth`) are a small `main.ts` or `main.tsx`
because they cannot share the main app's `serve()` table; they stay inline
`serve(callback)` harnesses.

`fixtures/app` calls `serve(app, { port: 0, errorFallback })`. Extra fixtures
call `serve(({ route }) => ({ … }), { port: 0, errorFallback })`.
`deno task test:int` picks up every `*_test.ts` under `int-tests/`.
