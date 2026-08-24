# dashi

TODO: replace this with the real README as part of the docs work.

Server-first web framework for Deno. JSX compiles to HTML strings. No VDOM, no
hydration, no client framework. Friends-and-family beta; the package is not
published yet.

## Implemented

- JSX → HTML strings with escaped XSS values
- Explicit route table with typed params, per-method handlers, layouts, and
  middleware. GET also answers HEAD (empty body, same headers). Every matched
  path answers OPTIONS.
- `<RouteFragment>` for composing another route into the current page (eager
  during SSR, or client-fetched when `lazy`)
- Forms inside a fragment submit to their `action` and swap only that fragment.
  The swap needs JavaScript; without it the same form posts normally and the
  response is a full page
- A write handler can return `fragment.replace`, `fragment.append`, and
  `fragment.remove` to update every host rendering those routes in one
  response. Replace is also the default for a body with no actions. Append
  and remove exist only as client actions and have no no-JS equivalent
- Example apps under `examples/`
- Static files from a directory via `staticFile` in a route handler
- Client TypeScript included via `client.module` / `client.element`; documents
  get an import map, and a module script only when a client host rendered

## Not yet

- JSR publish
- Production-ready SSR
- WebSocket / SSE push into fragments, and SSR streaming: omitted from
  friends-and-family ([COO-59](https://linear.app/cookingpot/issue/COO-59),
  Dashi v0.5). Fragment updates in F&F are request/response only

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
cases are the Integration check; browser cases are the E2E check.

## License

MIT
