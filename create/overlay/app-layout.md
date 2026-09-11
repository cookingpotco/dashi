# App layout

Every app is one tree. `main.ts` is the `serve()` callback and boots it.

A **page** is a folder that exports handlers for one path (`Home`,
`showGuestbook`, `addGuestbookEntry`). The table that owns that path binds them
with `route("/guestbook", { GET: showGuestbook, POST: addGuestbookEntry })`.
That table is the `serve()` callback or a wrap / prefix group's callback. A page
module never calls `route()` or `group()`, and never exports a `{ GET }` bag or
a function named `GET`.

`group()` is only a **prefixed subtree** (nested URLs, or layouts / middleware /
`notFound` on that prefix) or a **pathless wrap**. `group("/", …)` is the wrap
(no extra URL segment). `group("/docs", …)` is a prefixed subtree. `serve()` is
the root table, not a group.

## File names

Deno snake_case. Feature folders match the path (`docs/` for `/docs`). Layout
and middleware files are `{folder}_{role}`: `menu_layout.tsx`,
`menu_middleware.ts`. At the app root: `root_layout.tsx`,
`logger_middleware.ts`, `errors.tsx`. Client modules are `*_client.ts` and sit
beside the file that registers them. No `routes/` directory, no app `client/`
folder, and no `*_route.tsx`.

`errors.tsx` holds the named `notFound`, `error`, and `fatal` exports. Those are
not routes. Root `notFound` / `error` live on the root callback; a group's
`notFound` / `error` live on that group's `mod.ts`. `fatal` stays on `serve()`
options.

## Exports

A component that returns `Element` is PascalCase (`Home`, `RootLayout`).
Middleware and per-method handlers are camelCase (`logger`, `showGuestbook`,
`addGuestbookEntry`). Do not export `GET` as the function name. Do not export a
`{ GET: Home }` bag.

`mod.ts` (`mod.tsx` when the file contains JSX) is the page module or the group.

## Table

`main.ts` is the `serve()` callback. It binds `route()` for every root page,
then calls `serve`.

```tsx
// home/mod.tsx
export function Home({ html }: ReadArgs) {
  return html(<h1>Hello</h1>);
}
```

```ts
import { CacheStrategy, serve, staticFile } from "dashi";
import { Home } from "./home/mod.tsx";
import { error, fatal, notFound } from "./errors.tsx";
import { logger } from "./logger_middleware.ts";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    middleware: [logger],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/generated/:file", {
        GET: ({ ctx }) =>
          staticFile(ctx, `${import.meta.dirname}/generated`, ctx.params.file, {
            strategy: CacheStrategy.Immutable,
          }),
      }),
      route("/static/:file", {
        GET: ({ ctx }) =>
          staticFile(ctx, `${import.meta.dirname}/static`, ctx.params.file, {
            strategy: CacheStrategy.Immutable,
          }),
      }),
    ],
  }), { fatal });
}
```

## Styling

Tailwind v4 on `className` only. Source `styles.css`. `css.ts` writes
`generated/styles-<hash>.css` and `styles.json`; the layout imports the JSON.
Serve hashed CSS at `GET /generated/:file` with `CacheStrategy.Immutable`. Serve
unhashed files at `GET /static/:file`. No `class`, `tw`, or `css` props and no
framework CSS pipeline.

## Imports

App code imports from `dashi` (`ReadArgs`, `WriteArgs`, `Ctx`, `serve`, …). JSX
types (`Element`, `HTMLAttributes`, `DashiNode`, `JSX`) import from
`dashi/jsx-runtime`. Browser APIs import from `dashi/client`.
