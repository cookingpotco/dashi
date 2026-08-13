# dashi

A fragment is just a route. `<RouteFragment src="/comments" />` composes another
route into the current page — rendered inline during SSR, or fetched client-side
when marked `lazy`. Same code, same URL, two delivery modes.

Server-first: JSX compiles to HTML strings. No VDOM, no hydration, no client
framework. Deno-native.

Friends-and-family beta. The package is not published yet.

## Examples

```sh
cd examples/hello-world
deno task dev
```

`examples/fragments` shows inline and lazy `<RouteFragment>`.

## Development

Deno 2.9.5 (see `.tool-versions`). From the repo root:

```sh
deno fmt --check .
deno lint
deno task check
deno test -A
```

CI runs the same commands on every pull request and every push to `main`.

## License

MIT
