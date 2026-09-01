# Integration tests

These cases boot a real app in-process via `serve()`, request a URL, and assert
on the response. Adding coverage should mean writing a case, not writing
plumbing.

```sh
deno task test:int
```

`int-tests/` is a workspace member. Import the framework as `dashi`, the same
way `examples/` do.

## Add a case

If the fixture already has the route, append an `IntegrationTestCase` in that
fixture's `main_test.ts` and stop. If it needs a new path, add a page module (a
file next to the table when it is only handlers, otherwise a folder) and bind it
with `route()` on the root table under the shared root wraps. Use a `group()`
only when the path needs a prefix or wraps (layouts, middleware, `notFound`).
One request, several asserts: status, headers, then at most one of `html` or
`json`. `html` covers parsed DOM `select` plus raw `bodyIncludes` /
`bodyExcludes` (escaping, DOCTYPE, leftover `{{fragment:` markers). `json` is
the expected parsed object. Raw top-level `bodyIncludes` / `bodyExcludes` are
for responses that are neither (404, 405, empty 303). `runCase` parses HTML only
when `html` is set.

`runCase` executes that data. Flows that are not one request (cookies,
concurrent requests) use `boot` / `App.fetch` from `mod.ts` inside a `t.step`.
The test file imports `start` from the fixture and passes it to `boot(start)`.
Sequential cases share the fixture, so a POST can be followed by a GET that
observes it.

## Add a fixture app

`fixtures/app` is the main fixture: `main.ts` exports `start()`, which calls
`serve(({ route }) => ({ … }), { hostname: "127.0.0.1", port: 0, fatal })`. A
one-path page is a page module bound on the root table. `group()` is only a
prefixed subtree or a wrap shell. Put a new folder next to the fixture only when
the behaviour cannot live on that app. Do not add a fixture as its own workspace
member. Extra fixtures (`cors`, `error-defaults`, `error-fallback-response`,
`fragment-depth`) are a small `main.ts` or `main.tsx` because they cannot share
the main app's `serve()` table; they stay inline `serve(callback)` harnesses.
The test file imports `start` and passes it to `boot`. `deno task test:int`
picks up every `*_test.ts` under `int-tests/`.
