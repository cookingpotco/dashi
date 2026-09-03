# Fragments

A [fragment is a route](./thesis.md). `<RouteFragment src>` includes that
route’s rendered output. The same path is a document when opened directly, and a
slot when another page embeds it.

Reach for a fragment when a piece of the page has its own URL — a list you also
want to POST to, a count you want to cache, a panel you want to load later.
Reach for a component when it is only markup.

## Include

```tsx home/mod.tsx
import { RouteFragment } from "dashi";

export function Home() {
  return (
    <main>
      <h1>Todos</h1>
      <p>
        Count: <RouteFragment src="/todos/count" />
      </p>
      <RouteFragment src="/todos" />
      <RouteFragment
        src="/weather"
        lazy
        fallback={<p>Loading weather…</p>}
      />
      <RouteFragment
        src="/spotlight"
        lazy="visible"
        fallback={<p>Scroll to load</p>}
      />
    </main>
  );
}
```

`src` is a path, `` `/${string}` ``, resolved against the page URL. Identity is
`pathname + search`: `/todos?tab=open` and `/todos` are different hosts. The
runtime element is `<route-fragment>`.

Do not write `<route-fragment>` in JSX. Use `RouteFragment`.

## Eager, lazy, visible

The props are a discriminated union. TypeScript rejects illegal combinations
(`lazy="visible"` without `fallback`, `timeout` on a lazy include).

| Mode            | Props                   | When it fetches             | `fallback`   | `timeout`                 |
| --------------- | ----------------------- | --------------------------- | ------------ | ------------------------- |
| Eager (default) | `src`                   | During SSR                  | Illegal      | Optional, default 5000 ms |
| After connect   | `src`, `lazy`           | When the host connects      | Optional     | Illegal                   |
| In view         | `src`, `lazy="visible"` | First viewport intersection | **Required** | Illegal                   |

**Eager** when the include is cheap and you want it in the first HTML — a count,
a nav snippet, anything SEO or the first paint should show. The page request
forwards `cookie` and `authorization`. Identical `src` values on one page share
one inflight GET.

**`lazy`** when the include is slow or you want the document to paint first. SSR
ships `fallback` (or an empty host). After connect the browser GETs `src` with
`X-Fragment: 1` and `Accept: text/html`, preloads any `Link: rel=modulepreload`
scripts, and sets `innerHTML`.

**`lazy="visible"`** when the include is below the fold. `fallback` is required
so the host has a box to intersect. The fetch waits for the first intersection.

A timeout on an eager include behaves as a handler throw. If that route’s group
has `error`, the error UI is spliced into the host.

## The route

The include is a GET of a real row on the table. Handlers are ordinary page
modules.

```tsx todos/mod.tsx
import { type Ctx, group, patch } from "dashi";
import { todos as items } from "../todos.ts";

export const todos = group("/todos", ({ route }) => ({
  routes: [
    route("/", { GET: list, POST: create }),
    route("/count", { GET: count }),
  ],
}));

function TodoList({ error }: { error?: string }) {
  return (
    <div>
      <ul id="todos">
        {items.map((todo) => <li>{todo}</li>)}
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

function count() {
  return <span id="todo-count">{items.length}</span>;
}

async function create(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return [patch.replace("/todos", <TodoList error="title is required" />)];
  }
  items.push(title);
  return [
    patch.append("#todos", <li>{title}</li>),
    patch.replace(
      "/todos/count",
      <span id="todo-count">{items.length}</span>,
    ),
  ];
}
```

Layouts do **not** wrap fragment hits. `/todos` as a document gets the group and
root layouts; the homepage include is the list only. Use `ctx.isFragment` in the
handler if the document and the include must differ.

Open `/todos` in the browser. That is the same handler.

## Nesting

Fragments nest. An eager include inside a lazy host stays at `fallback` on the
document — the inner eager GET does not run until the lazy fetch returns HTML
that itself includes the inner `src`.

The eager include chain is capped by `fragmentDepthLimit` on `serve()` (default
5). A longer chain fails the request. A cycle (same pathname already in the
chain) fails too. Search-only loops count as cycles.

## Misses and errors

| Hit                            | Miss             | Exhausted `error`         |
| ------------------------------ | ---------------- | ------------------------- |
| Document                       | Group `notFound` | `fatal`                   |
| Fragment GET (`X-Fragment: 1`) | Empty 404        | Empty 500                 |
| Eager include on a document    | Empty slot       | Host throw → page `error` |

A fragment does not splice the parent’s 404 page into the slot.

## Forms in a fragment

The form can sit in the fragment, or anywhere on the page, as long as `action`
is the route. POST `/todos` from the homepage updates every
`<RouteFragment src="/todos">` and any `#id` the patches name.

That is the fragment-action path. It needs the client runtime (a
[client](./client.md) host, `RouteFragment`, or `<NavigationRoot>` loads it).
Without JavaScript, a write that returns patches is not a working form — use a
[POST-redirect-GET](./forms.md) for that.

A GET or lazy fetch **replaces the host that asked** with markup. Writes do not
return a document; they return patches or a `Response`.

## Patches

```ts
type Target = `/${string}` | `#${string}`;

patch.replace(target, body);
patch.append(target, body);
patch.prepend(target, body);
patch.before(target, body);
patch.after(target, body);
patch.remove(target);
patch.refresh(path); // `/${string}` only
```

- `` `/${string}` `` updates every `<RouteFragment>` whose `src` matches
  exactly, including the query string.
- `` `#${string}` `` updates `document.getElementById`.

`replace` / `append` / `prepend` mutate **children**. `before` / `after` insert
siblings. `remove` drops the node. To replace the node itself: `before` or
`after`, then `remove`.

`refresh` re-GETs matching hosts. Use `replace` when the write already has the
markup; use `refresh` when fragments should fetch themselves.

GET cannot return patches. The wire format is sibling `<dashi-patch>` elements —
do not write those in JSX.

After a successful patch-list write, the submitting form is reset.

## Caching

Wrap the fragment handler’s return in `cached()` the same way you would a page.
Each `src` is its own cache key. See [Routing](./routing.md).

## API

```tsx
<RouteFragment src="/todos" />
<RouteFragment src="/todos" lazy fallback={<p>Loading…</p>} />
<RouteFragment src="/todos" lazy="visible" fallback={<p>Loading…</p>} />
<RouteFragment src="/todos" timeout={2000} />
```

`timeout` is milliseconds to wait during SSR. Omitted is 5000. On timeout the
include behaves as a handler throw.

Other HTML attributes spread onto `<route-fragment>`.

Next: [Forms](./forms.md) for the document POST-redirect-GET path, and
[Client JS](./client.md) when a fragment is not enough.
