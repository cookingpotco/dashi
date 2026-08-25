# dashi

Server-first web framework for Deno. JSX compiles to HTML strings on the server
— no VDOM, no hydration, no client framework. Pages update by swapping
server-rendered fragments, in the spirit of [Hotwire](https://hotwired.dev/) and
[htmx](https://htmx.org/).

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
- No client framework: JS ships only when a client host renders.
- Explicit over magic — no file-system routing, no `_` prefixes.

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

<!-- TODO(COO-29): confirm the published version -->

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
Omit `lazy` to include during SSR; `timeout` is milliseconds to wait (5000 if
omitted), and a timeout fails the include.

```tsx
import { type Ctx, fragment, RouteFragment, serve } from "dashi";

const todos: string[] = [];

function Home() {
  return (
    <html>
      <h1>Todos</h1>
      <RouteFragment
        src="/todos"
        lazy
        fallback={<p>Loading…</p>}
      />
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
    return [
      fragment.replace("/todos", <TodoList error="title is required" />),
    ];
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
on fragment renders. A layout is `(ctx, children) => …`. Attach
`layouts: [RootLayout]` on the table or a `group()`.

**Middleware** is a `(ctx, next) => Response` factory attached on `group()`. It
runs for document hits and fragment hits.

**Prefixed `group()`** joins a path onto child routes. Nested `route` and
`group` see the accumulated prefix, and handlers get the joined params:

```tsx
group("/posts", ({ route }) => ({
  routes: [
    route("/:id", { GET: (ctx) => <p>{ctx.params.id}</p> }),
  ],
}));
```

**Error boundaries.** `notFound` and `error` live on the table. `errorFallback`
is the last-resort 500 on `serve()` options: no layouts, no `ctx`, no `thrown`.

**Client TypeScript** attaches with `client.module` / `client.element` at module
scope — not inside a component or handler. Documents get an import map; a module
script is added only when a client host rendered.

```tsx
const Clock = client.module(
  new URL("./clock_client.ts", import.meta.url),
);
```

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

- Link interception and Turbo-style navigation, planned for the next minor
  version.
- WebSocket / SSE push into fragments, and SSR streaming.
- Deno-only. JSR's npm compatibility means an install under Node succeeds, and
  then `Deno.serve` is not there.

## Stability

0.1.x. Breaking changes are expected while navigation and API consolidation
land. On `0.x` a break is a minor bump.

## Examples

Minimal working samples, not a recommended layout:

- [`examples/hello-world`](examples/hello-world) — routes, layouts, middleware,
  a form
- [`examples/fragments`](examples/fragments) — eager and lazy fragments, actions

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
