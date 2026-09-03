# Navigation

Wrap the swapping region in `<NavigationRoot>`. Same-origin clicks, GET forms,
and form redirects fetch the next document and replace that host’s children.
History, back / forward, and scroll restoration come with it.

Reach for this when the site should feel like one page without becoming an SPA
you write by hand. Leave it off when every click should be a real load — writes
still apply [patches](./fragments.md) if some other client host already loaded
the runtime.

## What it does

Put the host in the root layout, around the page slot. Chrome you leave
**outside** survives the swap.

```tsx root_layout.tsx
import { NavigationRoot, type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import { Go } from "./go.tsx";

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <head>
        <title>Navigation</title>
      </head>
      <body>
        <header>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <Go href="/about">Go about</Go>
        </header>
        <NavigationRoot>
          {children}
        </NavigationRoot>
      </body>
    </html>
  );
}
```

```tsx home/mod.tsx
export function Home() {
  return (
    <main>
      <h1>Home</h1>
      <p>
        <a href="/about">About</a>{" "}
        <a href="/about" hardNavigation>About (full load)</a>
      </p>
    </main>
  );
}
```

Intercepted:

- Same-origin `<a>` left-clicks (no modifier keys, no `download`, `target`
  `_self` or empty, no `hardNavigation`)
- GET [forms](./forms.md)
- POST responses that redirect (`res.redirected`) — the next document swaps in;
  back does not re-POST

Not intercepted: middle-click, modified click, download, other targets,
cross-origin, `hardNavigation`.

Only **one** connected `<navigation-root>` per document. A second throws.

Without `<NavigationRoot>`, GET navigation is a full page load.

## Head merge

The incoming document’s `<head>` is merged so title, meta, and stylesheets
update without unloading CSS already on the page.

- Stylesheets and scripts already present (matched by URL) stay
- The rest of the live head is replaced
- New stylesheets load **before** the swap
- The import map is preserved

A new hashed `/static/styles-<hash>.css` from
[Getting started](./getting-started.md) is a new link, so the new sheet is in
place when the body swaps. An unchanged hash is a no-op.

## Opt out

`hardNavigation` on `<a>`, `<form>`, `<button type="submit">`, or
`<input type="submit">` does a real load. It is a boolean JSX prop; the HTML
attribute is `hardnavigation`. It is not valid on a `div`.

```tsx
<a href="/about" hardNavigation>About (full load)</a>
<form method="POST" action="/guestbook" hardNavigation>
```

Use it for logout, file downloads, or anything that must not swap.

## `navigate()`

From [client TypeScript](./client.md):

```ts go_client.ts
import { navigate } from "dashi/client";

customElements.define(
  "dashi-go",
  class extends HTMLElement {
    connectedCallback() {
      this.addEventListener("click", () => {
        const href = this.getAttribute("href");
        if (href !== null) {
          void navigate(href);
        }
      });
    }
  },
);
```

```tsx go.tsx
import { client } from "dashi";

export const Go = client.element(
  "dashi-go",
  new URL("./go_client.ts", import.meta.url),
);
```

`navigate(url: string | URL): Promise<void>` is the same swap as a click. No
host, or a response that cannot swap → `location.assign`. Cross-origin → real
navigation.

## API

```tsx
<NavigationRoot>{children}</NavigationRoot>
<NavigationRoot id="main">{children}</NavigationRoot>
```

`NavigationRoot` accepts ordinary HTML attributes and renders
`<navigation-root>`. Do not write that tag in JSX.

`hardNavigation?: boolean` on links and submitters.

```ts
import { navigate } from "dashi/client";
await navigate("/about");
```
