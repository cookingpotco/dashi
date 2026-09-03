> **Not production ready.** dashi has not hit v1 yet and is under active
> development. Expect breaking changes in minor versions.

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="logo-dark.svg">
  <img alt="dashi" src="logo.svg" width="400" height="148">
</picture>
</p>

<p align="center">
<a href="https://jsr.io/@cookingpot/dashi"><img src="https://jsr.io/badges/@cookingpot/dashi" alt="JSR"></a>
<a href="https://github.com/cookingpotco/dashi/actions/workflows/ci.yml"><img src="https://github.com/cookingpotco/dashi/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
</p>

## What is dashi?

dashi is a server-first web framework for Deno that compiles JSX to HTML strings
on the server. No VDOM, no hydration, no client framework. Pages update by
swapping server-rendered fragments, in the spirit of
[Hotwire](https://hotwired.dev/) and [htmx](https://htmx.org/).

```tsx
import { serve } from "dashi";

serve(({ route }) => ({
  routes: [
    route("/", {
      GET: () => <h1>Hello</h1>,
    }),
  ],
}));
```

## Features

- **Route fragments.** Compose one route into another with
  `<RouteFragment src>`. Eager during SSR, `lazy` after connect, or
  `lazy="visible"` on first intersection, with `fallback` and `timeout`.
- **Patches.** In response to form submissions or manual API calls, handlers can
  return patches like `patch.replace` that target a specific fragment or element
  on the page.
- **Explicit route table.** Typed params from the path literal, and per-method
  handlers, in one `serve()` callback.
- **Web standards.** Handlers read `ctx.req` as a `Request` and return JSX or a
  `Response`. Client code uses native custom elements and plain DOM access.
- **Per-route cache control.** Wrap a handler, `notFound`, or error return in
  `cached()`.

## By design

- No runtime dependencies.
- Small and powerful API, with only one way to do each thing.
- Explicit client inclusion: JS ships only when you call `client.module` or
  `client.element` at module scope.
- Explicit over magic: no file-system routing, no prefixes or hidden flows.

## Quick start

```sh
deno add jsr:@cookingpot/dashi
```

Every config key a consumer needs, in one `deno.json`:

```json
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "dashi",
    "lib": ["dom", "deno.ns", "deno.unstable"]
  },
  "unstable": ["bundle"],
  "imports": {
    "dashi": "jsr:@cookingpot/dashi@^0.8.0"
  }
}
```

`unstable: ["bundle"]` is required until runtime `Deno.bundle` becomes stable.

`lib` is that exact list. `dom` types client modules. `deno.ns` and
`deno.unstable` are what `Deno.bundle` needs. A shorter array drops those.

Save the snippet at the top as `main.tsx`, then:

```sh
deno run -A --watch main.tsx
```

Open http://localhost:8000. Running without permission flags dies on
`Deno.env.get("DASHI_LOG")` at import, before serving.

The rest of the API — routing, fragments, forms, client JS, navigation, deploy —
is the handbook at [dashi.run/docs](https://dashi.run/docs). Markdown source
lives in [`docs/`](docs/).

## Not yet

- WebSocket / SSE push into fragments, and SSR streaming.
- Deno-only. JSR's npm compatibility means an install under Node succeeds, and
  then `Deno.serve` is not there.

## Examples

Minimal working examples, not best practice:

- [`examples/hello-world`](examples/hello-world): routes, layouts, middleware, a
  form
- [`examples/fragments`](examples/fragments): eager and lazy fragments, actions

## Development

Deno 2.9.5 (see `.tool-versions`). Test deps (`@std/assert`, deno-dom, Astral)
are the frozen lockfile plus `DENO_DIR` cache. Runtime deps (none today) are
copied into the repo as source and imported via a local path. From the repo
root:

```sh
deno fmt --check .
deno lint
deno check
deno task test
deno task test:int
deno task test:e2e
deno task test:e2e:headed
```

CI runs the same commands on every pull request and every push to `main`, except
`test:e2e:headed`, which is local-only. Unit tests stay on the Test check; HTTP
cases are the Integration check; browser cases are the E2E check. A version bump
on `main` is the release; see [RELEASING.md](RELEASING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
