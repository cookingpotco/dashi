# Getting started

dashi is a server-first web framework for Deno. JSX compiles to HTML on the
server. A route is a real URL — you can render it as a page, embed it as a
[fragment](./fragments.md), [post](./forms.md) to it, or
[navigate](./navigation.md) to it.

This page gets you from an empty directory to a running page with the JSX config
and stylesheet recipe a new app needs. After that, read
[the thesis](./thesis.md), then add a [form](./forms.md) and a
[lazy fragment](./fragments.md).

## Install

You need Deno 2.9 or newer, with permission to run `Deno.bundle` (unstable until
that API ships stable).

```sh
deno add jsr:@cookingpot/dashi
```

A `deno create` starter is not published yet. Write the files on this page by
hand.

## `deno.json`

Every key a consumer needs, in one file. Save this as `deno.json` at the project
root. A shorter `lib` array drops types `Deno.bundle` needs.
`unstable: ["bundle"]` is required until that API is stable — without it,
`client.module` / `client.element` fail when `serve()` compiles the client
graph.

```json consumer.deno.json
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "dashi",
    "lib": ["dom", "deno.ns", "deno.unstable"]
  },
  "unstable": ["bundle"],
  "imports": {
    "dashi": "jsr:@cookingpot/dashi@^0.8.0",
    "tailwindcss": "npm:tailwindcss@4",
    "@tailwindcss/cli": "npm:@tailwindcss/cli@4"
  },
  "tasks": {
    "css": "deno run -A css.ts",
    "css:watch": "deno run -A css.ts --watch",
    "dev": "DASHI_MINIFY_CLIENT=0 deno run -A --watch main.ts"
  }
}
```

`jsx: "precompile"` and `jsxImportSource: "dashi"` are the usual first-run
failure. Deno will not compile JSX without both, and it will not find the
runtime if the import map does not expose `dashi`.

The Tailwind packages are the styling recipe below. They are app dependencies.
dashi itself stays CSS-agnostic.

## Files

A page is a folder that exports handlers. `main.ts` is the route table and the
`serve()` call. Layout and error modules sit at the app root.

```
main.ts
home/mod.tsx
root_layout.tsx
errors.tsx
css.ts
styles.css
```

`css.ts` writes `styles.json` and `static/styles-<hash>.css`. Those two are
build artifacts; do not commit them.

## A page

```tsx home/mod.tsx
export function Home() {
  return (
    <main>
      <h1 className="text-2xl font-semibold">Hello</h1>
      <p>A page.</p>
    </main>
  );
}
```

`className` is the one way to put classes on an element. `class` is a type
error. There are no JSX event props (`onClick` and friends); see
[Client JS](./client.md).

## The table

`main.ts` binds every root path. `route()` exists only on the callback `serve()`
and `group()` pass you — do not import it. A page module never calls `route()`
or `group()`.

```ts main.ts
import { CacheStrategy, serve, staticFile } from "dashi";
import { error, fatal, notFound } from "./errors.tsx";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";

if (import.meta.main) {
  serve(({ route }) => ({
    layouts: [RootLayout],
    notFound,
    error,
    routes: [
      route("/", { GET: Home }),
      route("/static/:file", {
        GET: (ctx) =>
          staticFile(
            ctx,
            `${import.meta.dirname}/static`,
            ctx.params.file,
            { strategy: CacheStrategy.Immutable },
          ),
      }),
    ],
  }), { fatal });
}
```

`serve()` compiles the client graph, then returns the `Deno.HttpServer` from
`Deno.serve`. Extra options (`port`, `hostname`, `signal`) are `Deno.serve`'s,
plus `fatal` and `fragmentDepthLimit`. `handler` is always the router.

The `/static/:file` row is one path segment, not a tree catch-all. It exists so
the hashed stylesheet can be [cached](./routing.md) as immutable. Put only
content-addressed files on this route.

## Layout and errors

A layout is shared UI. It runs **after** the route has rendered, on document GET
and HEAD only. It does not run for [fragment](./fragments.md) includes. Do not
gate or set `ctx.state` in a layout — that belongs on [middleware](./routing.md)
or the handler. `ctx.state` is readonly in a layout.

```tsx root_layout.tsx
import type { WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import styles from "./styles.json" with { type: "json" };

export function RootLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <html>
      <head>
        <title>Hello</title>
        <link rel="stylesheet" href={styles.href} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`styles.json` is a known static JSON file, so it is imported as a module.
`deno run --watch` tracks that import: when `css.ts` writes a new hash, the
server restarts and the new `href` lands in HTML.

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

`notFound` and `error` live on the table. `fatal` is the last-resort 500 on
`serve()` options: no layouts, no `ctx`, no `thrown`. An `Element` becomes 500
HTML with a DOCTYPE; a `Response` is sent as-is. Omitted, `fatal` is
`new Response("Something Went Wrong", { status: 500 })`.

## Styling

Tailwind v4 is the recommended way to style a dashi app. Plain `.css` files,
`className`, and a string `style="…"` stay legal. Object `style={{ … }}` is
unsupported. There is no `class`, `tw`, or `css` prop.

dashi does not compile CSS. The app owns Tailwind as an `npm:` dependency and a
Deno task. Do not use the Play CDN or Vite.

Source file at the app root, **not** served:

```css styles.css
@import "tailwindcss";
@source "./**/*.{ts,tsx}";
```

`@source` is required. Tailwind v4's auto-detect walks to `.git` and silently
drops gitignored files.

`css.ts` runs the CLI, fingerprints the bytes, and writes a manifest:

```ts css.ts
const ROOT = import.meta.dirname;
const SOURCE = `${ROOT}/styles.css`;
const STATIC_DIR = `${ROOT}/static`;
const MANIFEST = `${ROOT}/styles.json`;

function runCli(outPath: string, watch: boolean): Deno.ChildProcess {
  const args = ["run", "-A"];
  if (watch) {
    args.push("--allow-scripts=npm:@parcel/watcher");
  }
  args.push(
    "npm:@tailwindcss/cli@4",
    "-i",
    SOURCE,
    "-o",
    outPath,
  );
  if (watch) {
    args.push("--watch");
  }
  return new Deno.Command(Deno.execPath(), {
    args,
    stdout: "inherit",
    stderr: "inherit",
    cwd: ROOT,
  }).spawn();
}

async function fingerprint(cssPath: string): Promise<void> {
  const bytes = await Deno.readFile(cssPath);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  let binary = "";
  for (const byte of digest) {
    binary += String.fromCharCode(byte);
  }
  const hash = btoa(binary).replaceAll("+", "-").replaceAll("/", "_")
    .replaceAll("=", "");
  const name = `styles-${hash}.css`;
  await Deno.mkdir(STATIC_DIR, { recursive: true });
  await Deno.writeFile(`${STATIC_DIR}/${name}`, bytes);
  await Deno.writeTextFile(
    MANIFEST,
    `${JSON.stringify({ href: `/static/${name}` }, null, 2)}\n`,
  );
  for await (const entry of Deno.readDir(STATIC_DIR)) {
    if (
      entry.isFile &&
      entry.name.startsWith("styles-") &&
      entry.name.endsWith(".css") &&
      entry.name !== name
    ) {
      await Deno.remove(`${STATIC_DIR}/${entry.name}`);
    }
  }
}

if (import.meta.main) {
  const tempDir = await Deno.makeTempDir({ prefix: "dashi-styles-" });
  const tempPath = `${tempDir}/styles.css`;
  const watch = Deno.args.includes("--watch");

  if (!watch) {
    const once = runCli(tempPath, false);
    const onceStatus = await once.status;
    if (!onceStatus.success) {
      Deno.exit(onceStatus.code);
    }
    await fingerprint(tempPath);
    await Deno.remove(tempDir, { recursive: true });
  } else {
    const child = runCli(tempPath, true);
    void child.status.then((status) => Deno.exit(status.code));
    const watcher = Deno.watchFs(tempDir);
    for await (const event of watcher) {
      if (event.kind === "access") {
        continue;
      }
      try {
        await fingerprint(tempPath);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
    }
  }
}
```

The hash alphabet matches compiled client JS: `+` / `/` become `-` / `_`, and
`=` is stripped.

`styles.json` looks like `{ "href": "/static/styles-<hash>.css" }`. Typecheck
and serve tasks should run `css` first so that import exists. Gitignore
`styles.json` and `static/styles-*.css`.

Custom CSS goes in `styles.css` after the import, or in additional files under
`static/` that you fingerprint if they share the Immutable route. Unhashed files
must not use `CacheStrategy.Immutable`.

Build CSS **before** you serve, including in production. Tailwind's Oxide engine
is a native addon — do not compile it inside the isolate that serves requests.

## Run

Two processes: the CSS watcher, and the server.

```sh
deno task css
deno task css:watch   # terminal 1
deno task dev         # terminal 2
```

`css` once so `styles.json` exists, then leave `css:watch` running while you
edit. Open http://localhost:8000.

`deno run` needs environment permission. `DASHI_LOG` is read at import; running
without `-A` or `--allow-env` dies before the server listens. `--watch` restarts
when `main.ts` or `styles.json` changes.

`DASHI_MINIFY_CLIENT=0` keeps client bundles readable in development. Set it to
`1` when you want minified `/_dashi/client/` output.

## Next

- [The thesis](./thesis.md) — a fragment is just a route
- [Routing](./routing.md) — the table, `group()`, layouts, middleware, errors,
  `staticFile`, `cached`, `status`
- [Fragments](./fragments.md) and [Forms](./forms.md) — a lazy include and a
  working form
- [Client JS](./client.md), [Navigation](./navigation.md), [Deploy](./deploy.md)
