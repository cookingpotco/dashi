# The thesis

A fragment is just a route.

That is the one idea to keep. Everything else in dashi is a way to treat a URL
as both a page and a piece of a page.

## One URL, four uses

`/todos` is a path in the [route table](./routing.md). The same path can:

- Render as a document when someone opens it
- Be included in another page with `<RouteFragment src="/todos" />`
- Receive a POST from a [form](./forms.md) on any page
- Be cached on its own, because it has its own `Cache-Control`

There is no second abstraction for “partial”, “island”, or “server component”.
The include is a GET of that route. The update is a write to that route. The CDN
sees a URL.

## Why that is interesting

Composition stays on the web’s terms. A header, a cart count, a comment thread —
each is a handler you can hit with a browser, a `<RouteFragment>`, or `curl`.
You debug it at its URL. You cache it without inventing a fragment cache.

Updates stay on the web’s terms too. A form posts to a path. The handler returns
a [redirect](./forms.md) (works with JavaScript off) or a list of
[patches](./fragments.md) that target that path — or an element id — in the live
document. The form does not have to live inside the thing it updates.

[Soft navigation](./navigation.md) is the same bet applied to the document: a
click is a GET, a GET form is a GET, and the next HTML swaps into a host. Opt
out per link when you want a real load.

## What it is not

It is not a client framework. JSX compiles to HTML strings. There is no VDOM, no
hydration, and no islands. Interactivity you add yourself is a
[custom element](./client.md) you register at module scope.

It is not file-system routing. Paths live in one table. A folder named
`guestbook/` does not become `/guestbook` until `main.ts` says so.

It is not a second docs product. The pages that follow are the API:
[routing](./routing.md), [fragments](./fragments.md), [forms](./forms.md),
[client JS](./client.md), [navigation](./navigation.md), [deploy](./deploy.md).
