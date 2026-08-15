# HTTP integration tests

These cases boot a real app in a subprocess, request a URL, and assert on the
response. Adding coverage should mean writing a case, not writing plumbing.

```sh
deno task test:int
```

## Add a case

If the fixture already has the route, append an `HttpCase` in `app_test.ts` and
stop. One request, several asserts: status, headers, `select` (parsed DOM
text/attributes), `bodyIncludes` / `bodyExcludes` (raw bytes — use these for
escaping, DOCTYPE, and leftover `{{fragment:` markers).

`runCase` executes that data. Flows that are not one request (redirect chains,
cookies, concurrent requests) use `boot` / `App.fetch` from `harness.ts` inside
a `t.step`.

## Add a fixture app

`fixtures/app` is the M1 app: one small tree covering the cases above. Put a new
folder next to it only when the behaviour cannot live on that app.

Each fixture is a `main.ts` that calls `serveFileBased({ port: 0 })` and a
`routes/` tree, the same shape as `examples/`. Import the framework as `dashi`.
Do not add the fixture as a workspace member.

The runner is keyed by the fixture's `main.ts` path. `app_test.ts` boots
`fixtures/app` once and runs its cases as `t.step`s. Example smokes in
`examples_test.ts` boot `examples/hello-world` and `examples/fragments` the same
way; they only check that those apps listen and serve a cheap path.
