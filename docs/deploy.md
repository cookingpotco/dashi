# Deploy

dashi is a Deno process. `serve()` calls `Deno.serve`. There is no adapter layer
and no Node runtime.

## Deno only

JSR’s npm compatibility means `npx jsr add @cookingpot/dashi` can succeed under
Node. Then `Deno.serve` is not there, `Deno.bundle` is not there, and
`Deno.realPath` is not there. The install is not a supported target.

The runtime needs:

- `Deno.serve`
- `Deno.bundle` (`unstable: ["bundle"]` in `deno.json` until that API is stable)
- `Deno.env` — `DASHI_LOG` is read at import
- `Deno.realPath` / `Deno.open` for `staticFile`

## Run the process

From [Getting started](./getting-started.md):

```sh
deno task css
deno run -A main.ts
```

Build CSS **once** as a deploy step. Do not run `@tailwindcss/cli` inside the
isolate that serves traffic — Oxide is a native addon.

`serve()` forwards `Deno.serve` options:

```ts
serve(({ route }) => ({
  routes: [route("/", { GET: Home })],
}), {
  hostname: "127.0.0.1",
  port: 8000,
  fatal,
});
```

Put a reverse proxy or CDN in front. Listen on loopback if the origin should not
be public. The F&F site is this shape: a systemd unit, a VM, Cloudflare in
front. Deno Deploy is not required, and it is not the story this handbook tells.

Permissions: `-A` is the blunt flag. The import-time `DASHI_LOG` read needs
`--allow-env`. `Deno.serve` needs net. `staticFile` and `Deno.bundle` need read
(and write if you emit elsewhere). Running without env permission dies before
listen.

## Environment

| Variable              | Default | Effect                                              |
| --------------------- | ------- | --------------------------------------------------- |
| `DASHI_LOG`           | `info`  | Minimum log level: `debug`, `info`, `warn`, `error` |
| `DASHI_MINIFY_CLIENT` | off     | `1` or `true` minifies `/_dashi/client/` bundles    |

Set `DASHI_MINIFY_CLIENT=1` in production.

## What the process does at boot

1. Build the route table (`group()` / `route()`). Duplicate paths and
   `/_dashi/*` app routes throw here.
2. `Deno.bundle` the registered `client.module` / `client.element` graph (and
   the framework’s own `route-fragment` / `navigation-root` entries when those
   hosts render).
3. Listen.

A missing `unstable: ["bundle"]` fails at step 2. A missing `styles.json` fails
when the layout imports it — run `deno task css` in CI or the deploy script.

## Caching at the edge

HTML is no-store until you wrap a return in [`cached()`](./routing.md). Hashed
`/static/styles-<hash>.css` is Immutable for a year because the URL changes when
the bytes change. Compiled client files at `/_dashi/client/*` are already
immutable.

Put a CDN in front if those headers should mean something off-box. Each
[fragment](./fragments.md) is its own URL, so it can have its own policy.

## Deno Deploy and other isolates

A Deno isolate can run `Deno.serve`. Check that your host allows **unstable
`Deno.bundle`** at request-boot, and do not compile Tailwind there. Prefer a
build step that uploads `styles.json` and `static/styles-*.css` with the
process.

If the host cannot run `Deno.bundle`, client JS and `<RouteFragment>` /
`<NavigationRoot>` will not compile. That host cannot run this app yet.

## 0.x

The package is `@cookingpot/dashi` on JSR. Versions before 1.0 expect breaking
changes in minor releases. Pin with `^0.8.0` the way
[Getting started](./getting-started.md) shows, and read the release notes when
you bump.

## Checklist

1. `deno.json` has `jsx`, `jsxImportSource`, `lib`, and `unstable: ["bundle"]`
2. `deno task css` has been run; `styles.json` exists
3. `deno run -A main.ts` (or your process manager’s equivalent) listens on the
   address the proxy expects
4. `DASHI_MINIFY_CLIENT=1` if you want minified client bundles
5. You are on Deno, not Node
