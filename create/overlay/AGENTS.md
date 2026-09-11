# Dashi app guide

Dashi is a server-first web framework for Deno. JSX compiles to HTML strings on
the server. There is no VDOM and no hydration. Every document ships the forms
client (submit interception and patch apply). Other client JavaScript attaches
through `client.module` / `client.element` at module scope.

Docs: https://dashi.run/docs

## One way

**Routes.** `main.ts` is the `serve()` table. A page is a folder exporting
handlers (`Home`, `showGuestbook`, `addGuestbookEntry`). Bind with
`route("/path", { GET: Home })`. The page never calls `route()` or `group()`,
never exports `GET` or a `{ GET }` bag. There is no file-based routing.

Handlers return a plain `Response` (redirect, JSON, 204, …) or render HTML with
`html()`, which runs layouts and builds the document response.

**Layouts.** `root_layout.tsx` is the document shell. `group()` is only a
prefixed subtree or a pathless wrap. `group("/")` is illegal.

**Slots.** Same-request UI is a component import. `<RouteSlot src>` GETs that
route later and swaps the slot. Use it when the shell can be cached but part of
the page cannot (user-specific chrome on a public page), or when work should
wait until after first paint (a heavy slot, or content below the fold with
`fetchWhen="visible"` and a `fallback`).

**Forms and patches.** The usual dashi flow is SSR page render → route slots
filled on the client → user submits a form → GET soft-navigates or a write
returns `patches()`. Drive UI changes with HTML renders, form submissions, and
patch lists. Avoid custom JS and JSON endpoints for routine UI updates.

**Styling.** Tailwind v4 on `className` only. No `class`, `tw`, or `css` props.
`css.ts` writes `generated/styles-<hash>.css` and `styles.json`. The layout
imports `styles.json`. Unhashed assets live under `/static/:file`.

## Best practices

- Cache full pages wherever the content allows.
- Keep handlers thin; put shared data on `ctx.state`.
- Reach for `RouteSlot` and patch updates before adding client modules.

## Run

```sh
deno task dev
```

Open http://localhost:8000.
