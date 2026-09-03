# Client JS

dashi does not ship a client framework. There are no islands, no hydration, and
no JSX event props. When a page needs a browser script, you register it at
**module scope** with `client.module` or `client.element`.

Reach for this when a [fragment](./fragments.md) or a [form](./forms.md) is not
enough: a clock, a drag handle, a clipboard button. If the work is “GET this URL
and swap HTML”, stay on fragments and [navigation](./navigation.md).

Islands — isolated interactive trees with their own state, mounted into SSR
markup — are not here. A custom element you upgrade is the escape hatch, not a
preview of that model.

## Register at module scope

```tsx home/mod.tsx
import { client } from "dashi";

const Clock = client.element(
  "dashi-clock",
  new URL("../clock_client.ts", import.meta.url),
);

const Analytics = client.module(
  new URL("../analytics_client.ts", import.meta.url),
);

export function Home() {
  return (
    <main>
      <h1>Client JS</h1>
      <Clock />
      <Analytics />
    </main>
  );
}
```

Both factories throw if you call them inside a component or handler: _call
client.module / client.element at module scope, not inside a component or
handler_.

`url` is absolute. The usual form is
`new URL("./clock_client.ts", import.meta.url)`.

App files are `*_client.ts` and sit beside the module that registers them.
Client modules do not import `dashi`. Browser APIs import from `dashi/client`.
DOM types come from the project `lib`, not a `/// <reference lib="dom" />`.

## `client.element`

Registers a custom element tag (kebab-case) and returns a component that renders
`<tag …>`. Props become attributes.

```ts clock_client.ts
customElements.define(
  "dashi-clock",
  class extends HTMLElement {
    #timer: ReturnType<typeof setInterval> | undefined;

    connectedCallback() {
      const tick = () => {
        this.textContent = new Date().toLocaleTimeString();
      };
      tick();
      this.#timer = setInterval(tick, 1000);
    }

    disconnectedCallback() {
      if (this.#timer !== undefined) {
        clearInterval(this.#timer);
      }
    }
  },
);
```

Name the DOM the way the HTML spec does. Prefer IDL properties (`form.method`,
`submitter.formAction`). Use `getAttribute` / `hasAttribute` when presence is
the question. `className` and `htmlFor` stop at the JSX runtime — they do not
appear in client code.

## `client.module`

Registers a bundle entry and returns a component that renders nothing. Use it
when the script should run because the host rendered, without a custom element.

```ts analytics_client.ts
console.log("page ready");
```

A document gets an import map for the compiled graph. A module `<script>` is
added **only when a client host rendered**. Pages with no `client.*` host and no
`RouteFragment` / `<NavigationRoot>` ship no module script.

## What compiles

`serve()` runs `Deno.bundle` (`platform: "browser"`, `format: "esm"`,
`codeSplitting: true`). That is why
[`unstable: ["bundle"]`](./getting-started.md) belongs in `deno.json`.

Public URLs are flat `/_dashi/client/<name>-<hash>.js`. Relative imports in
compiled files are rewritten to the matching bundler path. The import map is
bundler path → hashed URL.

Fragment responses do not inline those scripts. They send
`Link: rel=modulepreload` instead; a lazy host `import()`s them before swap.

`DASHI_MINIFY_CLIENT=1` (or `true`) minifies. `deno task dev` in
[Getting started](./getting-started.md) sets it to `0`.

`/_dashi/*` is reserved. `staticFile` is for app disk files, not this prefix.

## No `onClick`

`onClick`, `onSubmit`, and the rest are type errors: _dashi does not support JSX
event handlers; use a web component or a client script_. A function or object
passed as an attribute throws at render.

```tsx
<button type="button">Click</button>;
```

The click lives in `connectedCallback`, or in a listener the module attaches.

## `dashi/client`

The only browser export today is `navigate`:

```ts
import { navigate } from "dashi/client";

await navigate("/about");
```

That is the same swap [`<NavigationRoot>`](./navigation.md) uses. Without a
connected host, or if the response cannot be swapped, `navigate` does a real
load. Cross-origin is always a real load.

## Honest limits

- No islands, no signals, no client components as a rendering model.
- No JSX events. No `useEffect`.
- Registration is eager at import. There is no `client.lazy`.
- One document-level submit listener owns [forms](./forms.md). You do not attach
  your own per-form interceptor for dashi writes.
