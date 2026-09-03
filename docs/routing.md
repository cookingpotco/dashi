# Routing

The table is how you discover the rest of the server API: `serve` → `route` /
`group` → layouts → middleware → `error` / `notFound` / `fatal`. [Cache](#cache)
and [`status`](#status) hang off a handler return. [`staticFile`](#static-files)
is a helper you call from `{ GET }`.

## The table

`serve()` takes a pathless root callback. `route()` is a method on that
callback. Two `route()` calls for the same joined path are a compile error. GET
and POST share one row. A route needs at least one method.

```ts main.ts
import { CacheStrategy, serve, staticFile } from "dashi";
import { api } from "./api/mod.ts";
import { error, fatal, notFound } from "./errors.tsx";
import { Home } from "./home/mod.tsx";
import { Login } from "./login/mod.tsx";
import { logger } from "./logger_middleware.ts";
import { posts } from "./posts/mod.tsx";
import { RootLayout } from "./root_layout.tsx";
import { secret } from "./secret/mod.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/login", { GET: Login }),
      posts,
      secret,
      api,
      route("/assets/:path*", {
        GET: (ctx) =>
          staticFile(
            ctx,
            `${import.meta.dirname}/static`,
            ctx.params.path,
            { strategy: CacheStrategy.Immutable },
          ),
      }),
    ],
  }), { fatal });
}
```

`serve()` options are `Deno.serve`'s (`port`, `hostname`, `signal`, …), minus
`handler`, plus:

| Option               | Meaning                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fatal`              | Last-resort 500. No layouts, no `ctx`, no `thrown`. `Element` → 500 HTML with DOCTYPE; `Response` sent as-is. Omitted: `"Something Went Wrong"` at 500. |
| `fragmentDepthLimit` | Max eager include chain. Omitted is 5. A longer chain fails the request.                                                                                |

`/_dashi/*` is reserved. An app route under that prefix fails boot. Compiled
[client](./client.md) modules are served at `/_dashi/client/<name>-<hash>.js`.

## `group()`

A prefixed group is a URL subtree. Import `group` from `dashi` in that feature’s
`mod.ts` and drop the `Group` into the parent `routes`. `group("/")` is illegal.
Nested groups do not read ancestor params they did not declare; shared data goes
on `ctx.state`.

```tsx posts/mod.tsx
import { type Ctx, group, status } from "dashi";
import { PostsLayout } from "./posts_layout.tsx";

export const posts = group("/posts", ({ route }) => ({
  layouts: [PostsLayout],
  routes: [
    route("/", { GET: index }),
    route("/:id", { GET: show }),
  ],
}));

function index() {
  return <h1>Posts</h1>;
}

function show(ctx: Ctx<{ id: string }>) {
  if (ctx.params.id === "missing") {
    return status(404, <p>No such post</p>);
  }
  return <p>{ctx.params.id}</p>;
}
```

A pathless `group(({ route }) => …)` is a layout / middleware shell with no
extra prefix. It is not the `/` page.

```tsx secret/mod.tsx
import { group } from "dashi";
import { requireAuth } from "../auth_middleware.ts";

export const secret = group(({ route }) => ({
  middleware: [requireAuth],
  routes: [route("/secret", { GET: Secret })],
}));

function Secret() {
  return <p>Classified</p>;
}
```

## Paths and params

Paths start with `/`. No trailing slash except bare `/`. Empty segments are
rejected.

| Segment               | Syntax       | `ctx.params`       |
| --------------------- | ------------ | ------------------ |
| Static                | `/posts/new` | —                  |
| Param                 | `:id`        | `{ id: string }`   |
| Optional (last only)  | `:id?`       | `{ id?: string }`  |
| Catch-all (last only) | `:path*`     | `{ path: string }` |

Names are `[A-Za-z_][A-Za-z0-9_]*`. Bare `*` is rejected; the catch-all must be
named. Optional and catch-all cannot sit on a group prefix.

`ParamsOf<"/posts/:id">` is `{ id: string }`. Matching prefers static paths,
then more specific dynamic segments, then declaration order.

## `ctx`

```ts
interface Ctx<Params, State> {
  readonly req: Request;
  readonly url: URL;
  readonly params: Params;
  readonly isFragment: boolean;
  readonly state: Partial<State>;
}
```

`isFragment` is true for an eager include or a lazy fetch (`X-Fragment:
1`).
Mutate `state` in place; do not replace the object. Pass a `State` type argument
to `serve` / `group` so those fields type-check.

`WrapperCtx` is `Ctx` with wide `params` — what middleware and `error` see. One
wrap can cover `/` and `/posts/:id`. The handler keeps the precise keys.

Only the router calls a handler. A direct call skips that target’s middleware
and error boundary, applies the caller’s cache policy, and leaves the function
reading the caller’s `ctx`. Share markup as a component. Include another route’s
output with `<RouteFragment src>`.

## Methods

GET returns JSX, `cached()`, `status()`, or a `Response`. A `Response` is sent
as-is: no layouts, no DOCTYPE, no fragment splice.

POST, PUT, PATCH, and DELETE are write handlers. They return a `Response` or a
`Patch[]` — not a document. A 2xx `text/html` Response is rejected. See
[Forms](./forms.md) and [Fragments](./fragments.md).

GET also answers HEAD (body stripped, `Content-Length` kept). Every matched path
answers OPTIONS with 204 and `Allow`, unless `cors()` handles the preflight
first.

HEAD and OPTIONS are not keys on the route map.

## Layouts

Layouts are **shared UI only**. They wrap the route on document render,
outermost first, **after** the route has rendered. They do not run on fragment
renders. Never use them for gating or state-setting.

```tsx root_layout.tsx
import type { WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <head>
        <title>Routing</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

A group’s layouts wrap inside the parent’s. A group’s `error` does not catch
that group’s own layout throws — recovery starts at the parent.

`status()` is handlers-only. A layout returns `Element`.

## Middleware

Middleware is a `(ctx, next) => Response` factory attached on `group()` or the
root table. It runs for document hits **and** fragment hits, outermost first.
Call `next()` once.

```ts logger_middleware.ts
import type { WrapperCtx } from "dashi";

export async function logger(
  ctx: WrapperCtx,
  next: () => Promise<Response>,
): Promise<Response> {
  const started = Date.now();
  const res = await next();
  console.log(
    `${ctx.req.method} ${ctx.url.pathname} ${res.status} ${
      Date.now() - started
    }ms`,
  );
  return res;
}
```

Auth and other gates belong here, or on the handler:

```ts auth_middleware.ts
import type { WrapperCtx } from "dashi";

export function requireAuth(
  ctx: WrapperCtx,
  next: () => Promise<Response>,
): Promise<Response> {
  if (ctx.req.headers.get("authorization") === null) {
    return Promise.resolve(
      Response.redirect(new URL("/login", ctx.url), 303),
    );
  }
  return next();
}
```

Calling `next()` twice throws.

## CORS

CORS is middleware, imported from `dashi/cors`, attached on `group()`. It is not
a handler helper.

```ts api/mod.ts
import { group } from "dashi";
import { cors } from "dashi/cors";

export const api = group("/api", ({ route }) => ({
  middleware: [cors()],
  routes: [
    route("/ok", { GET: () => Response.json({ ok: true }) }),
  ],
}));
```

| Option          | Default                                                           |
| --------------- | ----------------------------------------------------------------- |
| `origin`        | `"*"` — or a string, a list, or `(origin) => string \| undefined` |
| `allowMethods`  | All routed methods                                                |
| `allowHeaders`  | Echo `Access-Control-Request-Headers`                             |
| `exposeHeaders` | —                                                                 |
| `maxAge`        | —                                                                 |
| `credentials`   | `false`. `true` requires an explicit `origin` that is not `"*"`   |

OPTIONS returns 204 with CORS headers and does **not** call `next()`, so the
route-level `Allow` header is not added. Other methods call `next()` and add
CORS headers to that response. A non-`*` origin adds `Vary: Origin`.

## Errors

| Export     | Where             | When                                     | Layouts                                               |
| ---------- | ----------------- | ---------------------------------------- | ----------------------------------------------------- |
| `notFound` | Table or group    | Document miss under that prefix          | Yes (that group’s chain)                              |
| `error`    | Table or group    | Handler throw, or an inner group failure | Remaining **parent** layouts, not the failing group’s |
| `fatal`    | `serve()` options | Error walk exhausted                     | No                                                    |

Omitted `notFound` walks to the parent. The root default is `"Not
found"`
at 404.

A fragment miss (`X-Fragment: 1`, unknown path) is an **empty** 404 — no
`notFound` page. A fragment that exhausts `error` is an **empty** 500, not
`fatal`. An eager include whose `src` misses leaves an empty slot on the
document; the parent page does not become a 404.

`error` receives `(ctx, thrown: unknown)`. A returned `Response` is sent as-is.

```tsx errors.tsx
import type { WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function notFound(): Element {
  return <p>Page not found</p>;
}

export function error(
  _ctx: WrapperCtx,
  thrown: unknown,
): Element {
  const message = thrown instanceof Error ? thrown.message : "Unknown error";
  return <p>{message}</p>;
}

export const fatal = (
  <html>
    <body>Something went wrong</body>
  </html>
);
```

## `status()`

`status(code, page)` sets the document HTTP status on a **matched** handler’s
JSX return. Layouts still wrap. A table miss uses `notFound`. An auth redirect
stays a middleware `Response`.

```tsx
return status(404, <p>No such post</p>);
```

You can wrap the page in `cached()`:
`status(404, cached(<p>…</p>, { strategy: CacheStrategy.Public, maxAge: 30 }))`.

`status()` is handlers-only.

## Cache

Without `cached()`, HTML is `no-store`. Wrap a handler, `notFound`, or `error`
return:

```tsx home/mod.tsx
import { cached, CacheStrategy } from "dashi";

export function Home() {
  return cached(
    <main>
      <h1>Hello</h1>
      <p>
        <a href="/posts/hello">A post</a>
      </p>
    </main>,
    { strategy: CacheStrategy.Public, maxAge: 60 },
  );
}
```

| Strategy                  | Header                                           | Extra fields                                                                              |
| ------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `CacheStrategy.Immutable` | `public, max-age=31536000, immutable`            | `varyHeaders?`                                                                            |
| `CacheStrategy.Public`    | `public, max-age=…`                              | `maxAge` (required), `sMaxAge?`, `staleWhileRevalidate?`, `staleIfError?`, `varyHeaders?` |
| `CacheStrategy.Private`   | `private, max-age=…`                             | `maxAge` (required), `staleWhileRevalidate?`, `varyHeaders?`                              |
| `CacheStrategy.NoStore`   | `no-cache, no-store, max-age=0, must-revalidate` | `varyHeaders?`                                                                            |

HTML responses always `Vary` on `x-fragment`, then any `varyHeaders`. Public and
Immutable cannot vary on `Cookie` or `*` — that throws when headers are applied.
Use Private or NoStore, or vary on a header the edge already copied.

Each route, including a [fragment](./fragments.md), can be cached on its own.
That is the point of “a fragment is just a route”.

Write handlers that return patches are always no-store.

## Static files

`staticFile(ctx, dir, relative, cache?)` streams a file from `dir`. Pass
`${import.meta.dirname}/static` so the folder travels with the module.
`relative` is the path under `dir` — usually a route param.

Default `cache` is Immutable. Traversal (`..`, encoded `..`, paths outside
`dir`) is a 404. A weak ETag comes from size and mtime; `If-None-Match` is 304.
Content-Type follows the extension; unknown is `application/octet-stream`.

`staticFile` only `Vary`s on `varyHeaders` you pass. It does not add
`x-fragment`. Shared caches still cannot vary on `Cookie` or `*`.

The hashed stylesheet in [Getting started](./getting-started.md) uses
`/static/:file` (one segment) and Immutable because the name **is** the content.
Unhashed files must not share that route. A tree of assets can use a named
catch-all:

```ts
route("/assets/:path*", {
  GET: (ctx) =>
    staticFile(ctx, `${import.meta.dirname}/static`, ctx.params.path),
});
```

## Page modules

A page folder exports handlers (`Home`, `list`, `add`). It does not export
`GET`, a `{ GET }` bag, or call `route()` / `group()`. The table that owns the
path binds them. A group folder is the exception: its `mod.ts` calls `group()`
and `route()` for its children.

See [Getting started](./getting-started.md) for the file tree, and
[Fragments](./fragments.md) for including one of these routes in another.
