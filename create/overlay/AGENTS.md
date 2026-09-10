# Dashi app guide

Dashi is a server-first web framework for Deno. JSX compiles to HTML strings on
the server. There is no VDOM and no hydration. Client JavaScript attaches only
through `client.module` / `client.element` at module scope.

Docs: https://dashi.run/docs and https://dashi.run/docs/routing

## One way

**Routes.** `main.ts` is the `serve()` table. A page is a folder exporting
handlers (`Home`, `list`, `add`). Bind with `route("/path", { GET: Home })`. The
page never calls `route()` or `group()`, never exports `GET` or a `{ GET }` bag.
There is no file-based routing.

**Layouts.** `root_layout.tsx` is the document shell. `group()` is only a
prefixed subtree or a pathless wrap. `group("/")` is illegal.

**Slots.** Same-request UI is a component import. A later GET uses
`<RouteSlot src>`.

**Forms.** Writes seal with `patches()`, or return a non-HTML `Response` (303
redirect, 204, JSON).

**Styling.** Tailwind v4 on `className` only. No `class`, `tw`, or `css` props.
`css.ts` writes `generated/styles-<hash>.css` and `styles.json`. The layout
imports `styles.json`. Unhashed assets live under `/static/:file`.

## Run

```sh
deno task dev
```

Open http://localhost:8000.
