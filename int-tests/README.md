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
`app_test.ts` and stop. One request, several asserts: status, headers, `select`
(parsed DOM text/attributes; use child combinators when the tree matters),
`bodyIncludes` / `bodyExcludes` (raw bytes — use these for escaping, DOCTYPE,
and leftover `{{fragment:` markers). Every case is parsed as HTML.

`runCase` executes that data. Flows that are not one request (redirect chains,
cookies, concurrent requests) use `boot` / `App.fetch` from `harness.ts` inside
a `t.step`.

## Add a fixture app

`fixtures/app` is the M1 app: one small tree covering the cases above. Put a new
folder next to it only when the behaviour cannot live on that app. Do not add a
fixture as its own workspace member.

Each fixture is a `main.ts` that calls `serveFileBased({ port: 0 })` and a
`routes/` tree, the same shape as `examples/`.

The runner is keyed by the fixture's `main.ts` path. `app_test.ts` boots
`fixtures/app` once and runs its cases as `t.step`s.
