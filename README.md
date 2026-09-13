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

dashi is a server-first web framework for Deno. JSX is precompiled to HTML with
no VDOM intermediary or hydration. Pages update by swapping server-rendered
HTML, in the spirit of [Hotwire](https://hotwired.dev/) and
[htmx](https://htmx.org/).

```tsx
import { type ReadArgs, serve } from "dashi";

function Home({ html }: ReadArgs) {
  return html(<h1>Hello</h1>);
}

serve(({ route }) => ({
  routes: [
    route("/", { GET: Home }),
  ],
}));
```

```sh
deno create jsr:@cookingpot/dashi
```

Learn more on [dashi.run](https://dashi.run).

## Not yet

- WebSocket / SSE push into slots, and SSR streaming.
- Deno-only. JSR's npm compatibility means an install under Node succeeds, and
  then `Deno.serve` is not there.

## Examples

Minimal working examples, not best practice:

- [`examples/starter`](examples/starter): routes, layouts, middleware, error
  pages, Tailwind. This is what `deno create` scaffolds;
  `create/generated_files.ts` is generated from it with `deno task create:gen`.
- [`examples/slots`](examples/slots): route slots, patches, component imports

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
deno task create:gen:check
```

CI runs the same commands on every pull request and every push to `main`, except
`test:e2e:headed`, which is local-only. After editing `examples/starter` or
`create/overlay`, run `deno task create:gen` and commit
`create/generated_files.ts`.

See [RELEASING.md](RELEASING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
