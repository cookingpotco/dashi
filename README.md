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

Learn more in the [dashi docs](https://dashi.run/docs/introduction).
