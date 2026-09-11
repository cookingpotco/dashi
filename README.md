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
swapping server-rendered route slots, in the spirit of
[Hotwire](https://hotwired.dev/) and [htmx](https://htmx.org/).

```tsx
import { serve } from "dashi";

serve(({ route }) => ({
  routes: [
    route("/", {
      GET: ({ html }) => html(<h1>Hello</h1>),
    }),
  ],
}));
```

## Features

- **Route slots.** Client-fetch an explicit route with `<RouteSlot src>`.
  `fetchWhen="visible"` waits for first intersection (`fallback` required); omit
  `fetchWhen` to fetch when connected.
- **Patches.** In response to form submissions or manual API calls, handlers
  seal a patch list with `patches()` — `patch.update`, `patch.replace`, and
  friends target `#id` holes; `patch.refresh` re-GETs every matching slot.
- **Explicit route table.** Typed params from the path literal, and per-method
  handlers, in one `serve()` callback.
- **Web standards.** Handlers read `ctx.req` as a `Request` and return a
  `Response`. HTML goes through `html()` or `patches()`. Client code uses native
  custom elements and plain DOM access.
- **Per-route cache control.** Pass `{ cache }` to `html()`.

## By design

- No runtime dependencies.
- Small and powerful API, with only one way to do each thing.
- Explicit client inclusion: JS ships only when you call `client.module` or
  `client.element` at module scope.
- Explicit over magic: no file-system routing, no prefixes or hidden flows.

## Quick start

```sh
deno create jsr:@cookingpot/dashi -- my-dashi-app
cd my-dashi-app
deno task dev
```

Open http://localhost:8000.

## Route slots

Same-request UI is a component import. A `<RouteSlot src>` GETs that route later
and swaps the slot. `fetchWhen="visible"` waits for the first viewport
intersection (`fallback` is required). Omit `fetchWhen` to fetch when connected;
`fallback` is optional on connected slots.

```tsx
<RouteSlot src="/todos" />
<RouteSlot
  src="/demo"
  fetchWhen="visible"
  fallback={<p>Loading...</p>}
/>
```

```tsx
import { patch, type ReadArgs, RouteSlot, serve, type WriteArgs } from "dashi";

const todos: string[] = [];

function Home({ html }: ReadArgs) {
  return html(
    <html>
      <h1>Todos</h1>
      <RouteSlot src="/todos" />
    </html>,
  );
}

function TodoList({ error }: { error?: string }) {
  return (
    <div>
      <ul id="todos">
        {todos.map((todo) => <li>{todo}</li>)}
      </ul>
      {error ? <p>{error}</p> : null}
      <form method="POST" action="/todos">
        <input name="title" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

function list({ html }: ReadArgs) {
  return html(
    <div id="todos-root">
      <TodoList />
    </div>,
  );
}

async function create({ ctx, patches }: WriteArgs) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return patches([
      patch.update("#todos-root", <TodoList error="title is required" />),
    ], { status: 422 });
  }
  todos.push(title);
  return patches([patch.update("#todos-root", <TodoList />)]);
}

serve(({ route }) => ({
  routes: [
    route("/", { GET: Home }),
    route("/todos", { GET: list, POST: create }),
  ],
}));
```

A slot GET replaces the host that asked with markup. `patch.update` / `replace`
/ `append` / `prepend` / `before` / `after` / `remove` each take a `#${string}`
id. `refresh` accepts only a route and re-GETs every `<route-slot src="…">`.
`update` replaces children; `replace` swaps the element itself. `before` /
`after` sit beside the target. Use `update` or `replace` when the write has the
markup; use `refresh` when slots should re-fetch themselves asynchronously. A
write handler seals that list with `patches()`, or returns a non-HTML `Response`
(redirect, JSON, 204, etc.). The form can sit anywhere on the page.

## Other features

**Layouts** are shared UI only. They wrap the route on document render,
outermost first, after the route has rendered, and do not run on slot renders.
Never use them for gating or state-setting — that belongs on middleware or
individual route handlers. A layout is `({ ctx, children }) => ...`. Attach
`layouts: [RootLayout]` on the table or a `group()`.

**Middleware** is a `({ ctx, next }) => Response` factory attached on `group()`.
It runs for document hits and slot hits.

**Prefixed `group()`** joins a path onto child routes. Import `group` from
`dashi` in a feature `mod.ts` and drop the `Group` into the root callback:

```tsx
// posts/mod.tsx
import { group } from "dashi";

export const posts = group("/posts", ({ route }) => ({
  routes: [
    route("/:id", { GET: ({ ctx, html }) => html(<p>{ctx.params.id}</p>) }),
  ],
}));
```

```tsx
// main.ts
import { serve } from "dashi";
import { posts } from "./posts/mod.ts";

serve(({ route }) => ({
  routes: [
    route("/", { GET: Home }),
    posts,
  ],
}));
```

**Error boundaries.** `notFound` and `error` live on the table. `fatal` is the
last-resort 500 on `serve()` options: no layouts, no `ctx`, no `thrown`.

**Client TypeScript** attaches with `client.module` / `client.element` at module
scope, not inside a component or handler. Documents get an import map. A module
script is added only when a client host rendered.

```tsx
const Clock = client.module(new URL("./clock_client.ts", import.meta.url));
```

**Soft navigation.** Wrap the swapping region in `<NavigationRoot>` in the root
layout. Same-origin clicks, GET forms, and form redirects fetch the next
document and replace the host's children. History, back/forward, and scroll
restoration are included. Opt a link or form out with `hardNavigation`. From
client TypeScript, `import { navigate } from "dashi/client"` and call
`navigate(url)` for the same swap. Persistent elements left outside the host
survive. The incoming document's `<head>` is merged so title, meta, and
stylesheets update without unloading CSS already on the page. After a successful
swap, the host dispatches `dashi:navigated` (`bubbles`, `composed`) with
`{ url, push }`. Listen on `document` or the host.

```ts
document.addEventListener("dashi:navigated", (event) => {
  if (!(event instanceof CustomEvent)) {
    return;
  }
  const { url, push } = event.detail;
});
```

**Static files** from a directory: `staticFile(ctx, dir, relative)` in a route
handler. Pass `${import.meta.dirname}/static` so the folder travels with the
module.

**CORS** is `import { cors } from "dashi/cors"`, attached on `group()` in a
feature `mod.ts`:

```tsx
// api/mod.ts
import { group } from "dashi";
import { cors } from "dashi/cors";

export const api = group("/api", ({ route }) => ({
  middleware: [cors()],
  routes: [route("/ok", { GET: () => Response.json({ ok: true }) })],
}));
```

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
