# Integration tests

These cases boot a real app in a subprocess, request a URL, and assert on the
response. Adding coverage should mean writing a case, not writing plumbing.

```sh
deno task test:int
```

`int-tests/` is a workspace member. Import the framework as `dashi`, the same
way `examples/` do.

## Add a case

If the fixture already has the route, append an `IntegrationTestCase` in
`app_test.ts` and stop. If it needs a new path, add a `route()` leaf in the
fixture `main.ts` under the shared root wraps, or a nested `group` when it needs
extra wraps, and import the handler. One request, several asserts: status,
headers, then at most one of `html` or `json`. `html` covers parsed DOM `select`
plus raw `bodyIncludes` / `bodyExcludes` (escaping, DOCTYPE, leftover
`{{fragment:` markers). `json` is the expected parsed object. Raw top-level
`bodyIncludes` / `bodyExcludes` are for responses that are neither (404, 405,
empty 303). `runCase` parses HTML only when `html` is set.

`runCase` executes that data. Flows that are not one request (cookies,
concurrent requests) use `boot` / `App.fetch` from `harness.ts` inside a
`t.step`. Sequential cases share the fixture process, so a POST can be followed
by a GET that observes it.

## Add a fixture app

`fixtures/app` is the M1 app: one small tree covering the cases above. Put a new
folder next to it only when the behaviour cannot live on that app. Do not add a
fixture as its own workspace member.

Each fixture is a `main.ts` that calls
`serve({ layouts, middleware, routes }, { port: 0 })` with `route()` leaves.
Shared wraps live on `serve` or a nested `group`. The runner is keyed by the
fixture's `main.ts` path. `app_test.ts` boots `fixtures/app` once and runs its
cases as `t.step`s.
