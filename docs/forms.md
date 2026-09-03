# Forms

A form is HTML. `method` and `action` are the API. dashi intercepts submit in
one document-level listener when the client runtime is loaded — there is no
per-element listener and no “nearest host” targeting.

Two write shapes, one job each:

| Return                        | Works with JS off | Use when                                                                                       |
| ----------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `Response.redirect(url, 303)` | Yes               | The next view is a document. Validation errors ride a query param or other GET-readable state. |
| `Patch[]`                     | No                | The page stays put and [fragments](./fragments.md) or `#id`s update.                           |

A write handler **cannot** return JSX. There is no “re-render this document from
POST”. Pick a redirect or a patch list.

## POST-redirect-GET

The form posts to the same path it renders. The write validates, mutates, and
redirects. The GET reads the store — and any error flag on the URL.

```tsx guestbook/mod.tsx
import { type Ctx } from "dashi";
import { entries } from "../guestbook.ts";

function Guestbook({ error }: { error?: string }) {
  return (
    <div>
      <h1>Guestbook</h1>
      <ul>
        {entries.map((entry) => <li>{entry}</li>)}
      </ul>
      {error ? <p>{error}</p> : null}
      <form method="POST" action="/guestbook">
        <input name="body" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export function list(ctx: Ctx) {
  const error = ctx.url.searchParams.get("error") === "required"
    ? "body is required"
    : undefined;
  return <Guestbook error={error} />;
}

export async function add(ctx: Ctx) {
  const body = (await ctx.req.formData()).get("body");
  if (typeof body !== "string" || body.trim() === "") {
    return Response.redirect(
      new URL("/guestbook?error=required", ctx.url),
      303,
    );
  }
  entries.push(body);
  return Response.redirect(new URL("/guestbook", ctx.url), 303);
}
```

Bind both methods on one row:

```ts main.ts
import { serve } from "dashi";
import { error, fatal, notFound } from "./errors.tsx";
import { add, list } from "./guestbook/mod.tsx";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/guestbook", { GET: list, POST: add }),
    ],
  }), { fatal });
}
```

303 is the status that turns a POST into a GET. The client treats a redirected
response as navigation: with [`<NavigationRoot>`](./navigation.md) the next
document swaps in place; without it, `location.assign`. Back does not re-POST.

This is the path that works with JavaScript off. Use it for anything that must.

## Patches

When the form should update a slot instead of loading a document, return a list
of `patch.*` calls. The list can be empty (`[]`) — the form stays as it is.

See [Fragments](./fragments.md) for the full patch API. The short version:

```ts
return [patch.replace("/todos", <TodoList error="title is required" />)];
// or
return [
  patch.append("#todos", <li>{title}</li>),
  patch.replace("/todos/count", <span>{n}</span>),
];
```

`` `/${string}` `` updates every `<RouteFragment>` rendering that `src`.
`` `#${string}` `` updates that id. `refresh("/todos")` asks those hosts to
re-GET.

The form does not have to live inside the fragment. `action="/todos"` from
anywhere on the page is enough.

A 2xx `text/html` `Response` from a write is rejected (it becomes an error).
Patches are not a document: no DOCTYPE, no layouts, `Cache-Control: no-store`.

## Validation

Read `ctx.req.formData()`. Check types — `FormData.get` is
`File |
string | null`.

- **PRG:** redirect to a GET that can show the error (`?error=required`, a flash
  on `ctx.state` you set in middleware, a store the GET reads).
- **Patches:** `patch.replace` the fragment or an `#error` node with the
  message. The field values stay until the successful write resets the form.

Do not call the GET handler from POST. Share a component (`Guestbook`,
`TodoList`) and let the router invoke the GET on the redirect or the next
include.

## GET forms

`method="GET"` builds a query string from the fields and
[navigates](./navigation.md) there. With `<NavigationRoot>` that is a soft swap;
without it, a real load. Use GET for search and filters.

`method="dialog"` is left to the browser.

## What the client intercepts

When the client runtime is present (a `RouteFragment`, `<NavigationRoot>`, or
your own `client.module` / `client.element`):

| Submit                                    | Behavior                                                             |
| ----------------------------------------- | -------------------------------------------------------------------- |
| GET                                       | `navigate` to `action` plus the field query                          |
| POST / PUT / PATCH / DELETE               | `fetch` with `Accept: text/html`; apply patches or follow a redirect |
| `hardNavigation` on the form or submitter | Real document load                                                   |
| Cross-origin or non-empty `target`        | Native                                                               |

`aria-busy` is set on the form for the write and blocks a second submit. A
successful patch-list write resets the form.

`enctype="multipart/form-data"` sends `FormData`. Otherwise the body is
`URLSearchParams`. File inputs in the urlencoded case send the filename string
only.

Browser-native `<form method>` is GET or POST. PUT / PATCH / DELETE need the
interceptor (or a `fetch` you write). They are still valid keys on the route
map.

## `ctx`

`ctx.req` is the `Request`. `ctx.url` is the request URL — use it as the base
for redirects so the host and protocol stay correct behind a proxy.

```ts
return Response.redirect(new URL("/guestbook", ctx.url), 303);
```

## One way

Middleware is not how you serve a form. `staticFile` is not how you parse
fields. A write that should be a document uses 303; a write that should update
slots uses `patch`. Do not add a third shape.
