# dashi

> **Not production ready.** dashi has not hit v1 yet and is under active
> development. Expect breaking changes in minor versions.

<img align="right" width="220" height="220" alt="dashi" src="logo.svg" hspace="24" style="margin-left: 24px;">

Server-first web framework for Deno that compiles JSX to HTML strings on the
server. No VDOM, no hydration, no client framework. Pages update by swapping
server-rendered fragments, in the spirit of [Hotwire](https://hotwired.dev/) and
[htmx](https://htmx.org/). Published on [JSR](https://jsr.io/@cookingpot/dashi).

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
  `<RouteFragment src>`. Eager during SSR, or `lazy` after load, with `fallback`
  and `timeout`.
- **Fragment actions.** A form inside a fragment submits without a full page
  load. The write handler returns `fragment.replace`, `fragment.append`, or
  `fragment.remove`, targeting every host rendering that route.
- **Explicit route table.** Typed params from the path literal, and per-method
  handlers, in one `serve()` callback.
- **Web standards.** Handlers read `ctx.req` as a `Request` and return JSX or a
  `Response`. Client code uses native custom elements and plain DOM access.
- **Per-route cache control.** Wrap any handler or layout return in `cached()`.

## By design

- No runtime dependencies.
- One way to do a thing.
- Explicit client inclusion: JS ships only when you call `client.module` or
  `client.element` at module scope.
- Explicit over magic: no file-system routing, no `_` prefixes.

## Quick start

```sh
deno add jsr:@cookingpot/dashi
```

Every config key a consumer needs, in one `deno.json`:

```json
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "dashi"
  },
  "unstable": ["bundle"],
  "imports": {
    "dashi": "jsr:@cookingpot/dashi@^0.1.0"
  }
}
```

`unstable: ["bundle"]` is required until runtime `Deno.bundle` becomes stable.

Leave `compilerOptions.lib` unset. Deno's default is enough. A partial `lib`
array drops types the compiler and `Deno.bundle` need.

Save the snippet at the top as `main.tsx`, then:

```sh
deno run -A --watch main.tsx
```

Open http://localhost:8000. Running without permission flags dies on
`Deno.env.get("DASHI_LOG")` at import, before serving.

## Fragments

A lazy fragment shows `fallback` during SSR and fetches its route after load.
Omit `lazy` to include during SSR. `timeout` is milliseconds to wait (5000 if
omitted), and a timeout fails the include.

```tsx
import { type Ctx, fragment, RouteFragment, serve } from "dashi";

const todos: string[] = [];

function Home() {
  return (
    <html>
      <h1>Todos</h1>
      <RouteFragment src="/todos" lazy fallback={<p>Loading...</p>} />
    </html>
  );
}

function TodoList({ error }: { error?: string }) {
  return (
    <div>
      <ul>
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

function list() {
  return <TodoList />;
}

async function create(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return [fragment.replace("/todos", <TodoList error="title is required" />)];
  }
  todos.push(title);
  return [fragment.replace("/todos", <TodoList />)];
}

serve(({ route }) => ({
  routes: [
    route("/", { GET: Home }),
    route("/todos", { GET: list, POST: create }),
  ],
}));
```

A GET or lazy fetch replaces the host that asked with markup. `fragment.replace`
/ `append` / `remove` update every `<RouteFragment>` rendering that `src`.

## Other features

**Layouts** wrap the route on document render, outermost first, and do not run
on fragment renders. A layout is `(ctx, children) => ...`. Attach
`layouts: [RootLayout]` on the table or a `group()`.

**Middleware** is a `(ctx, next) => Response` factory attached on `group()`. It
runs for document hits and fragment hits.

**Prefixed `group()`** joins a path onto child routes. Nested `route` and
`group` see the accumulated prefix, and handlers get the joined params:

```tsx
group("/posts", ({ route }) => ({
  routes: [route("/:id", { GET: (ctx) => <p>{ctx.params.id}</p> })],
}));
```

**Error boundaries.** `notFound` and `error` live on the table. `errorFallback`
is the last-resort 500 on `serve()` options: no layouts, no `ctx`, no `thrown`.

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
stylesheets update without unloading CSS already on the page. Per-page title and
meta live on `ctx.state` for the layout to render.

**Static files** from a directory: `staticFile(ctx, dir, relative)` in a route
handler. Pass `${import.meta.dirname}/static` so the folder travels with the
module.

**CORS** is `import { cors } from "dashi/cors"`, attached on `group()`:

```tsx
group("/api", ({ route }) => ({
  middleware: [cors()],
  routes: [route("/ok", { GET: () => Response.json({ ok: true }) })],
}));
```

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
