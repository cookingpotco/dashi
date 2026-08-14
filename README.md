# dashi

TODO: replace this with the real README as part of the docs work.

Server-first web framework for Deno. JSX compiles to HTML strings. No VDOM, no
hydration, no client framework. Friends-and-family beta; the package is not
published yet.

## Implemented

- JSX → HTML strings with escaped XSS values
- File-based routing, layouts, and middleware
- `<RouteFragment>` for composing another route into the current page (eager
  during SSR, or client-fetched when `lazy`)
- Example apps under `examples/`

## Not yet

- JSR publish
- Static asset serving
- Production-ready SSR (concurrency still has a known defect)

## Development

Deno 2.9.5 (see `.tool-versions`). Remote modules are in `vendor/`. From the
repo root:

```sh
deno fmt --check .
deno lint
deno check
deno test -A
```

CI runs the same commands on every pull request and every push to `main`.

## License

MIT
