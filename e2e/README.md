# Browser tests

These cases boot a real app in a subprocess, open it in Chromium, and assert on
the live DOM after JS has run. HTTP status, headers, and HTML bytes stay in
`int-tests/`.

```sh
deno task test:e2e
deno task test:e2e:headed
```

`test:e2e` is headless (what CI runs). `test:e2e:headed` is the same tests with
a visible window, for local debugging. The first run downloads Chrome into
`~/.cache/astral` (or `$XDG_CACHE_HOME/astral`).

`e2e/` is a workspace member. Import the framework as `dashi`, the same way
`int-tests/` and `examples/` do. Astral is a test dependency of this member.

## Add a case

If the fixture already has the page, append a `t.step` inside that fixture's
`withBrowser` and stop. If it needs a new path, add a `route()` leaf in the
fixture `main.ts` `serve()` callback and import the handler. A new fixture
folder is a new `Deno.test` that calls `withBrowser` once.

`withBrowser` boots the app, launches Chromium, and gives
`{ app, page, browser }`. Use Astral's page API (`goto`, `$`, `evaluate`,
`waitForNavigation`, …) and `@std/assert`. Assert on the DOM and URL, not on
screenshots.

On failure, the harness appends the page HTML and the app's stderr to the error,
and writes HTML, stderr, and a screenshot under `e2e/results/` (gitignored).
`test:e2e` also writes JUnit there.

## Add a fixture app

`fixtures/app` is the main fixture: a flat folder of `*_route` / `*_layout`
modules plus `main.ts`, matching the examples. Put a new folder next to it only
when the behaviour cannot live on that app. Do not add a fixture as its own
workspace member.
