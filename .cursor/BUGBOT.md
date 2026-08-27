# Bugbot review guidance for dashi

dashi is a server-side web framework for Deno. JSX compiles to concatenated HTML
**strings** rather than a virtual DOM, and every response is assembled
server-side. There is deliberately no client framework.

That shape determines what matters in review: the framework's entire output is
interpolated HTML, and its request path runs concurrently under `Deno.serve`.

## Prioritise these

- **Unescaped interpolation into HTML.** Any value reaching body text or an
  attribute value without escaping is an injection vector. This is the single
  highest-value thing to catch.
- **Module-level mutable state touched during a request.** Two concurrent
  requests sharing a module-scoped object will overwrite each other. Flag any
  new instance of this pattern.
- **Unawaited async work in the request path.** A dropped promise means the
  response is built before the work finishes.
- **New external dependencies in framework source.** The framework currently has
  _zero_ — test files import `@std/assert`, `int-tests/` also imports
  `@b-fuze/deno-dom`, and `e2e/` imports `@astral/astral`. Astral is a test
  dependency of that member, not a runtime dependency. A new runtime dependency
  is a significant decision, not an implementation detail.
- **Type assertions and `any` that hide real errors** rather than expressing
  something the compiler cannot see.
- **A behaviour change with no test covering it.** Flag that. Do not demand a
  unit test of glue code when a black-box assertion on the output would cover
  it.
- **A second way to do the same thing.** A new alias prop, twin type, or
  overlapping concept beside an existing one, with no crisp distinction. Flag
  it. Equivalent twins (`class` / `className`) should be one API, not two.

## Do not flag

- **Formatting.** `deno fmt` is authoritative. Never comment on style, spacing,
  or line breaks.
- **Missing `key` props in JSX.** There is no VDOM. `jsx-key` is off.
- **A missing unit test of routing, SSR, or other glue** when the change is
  already visible in rendered HTML, or when the right coverage is an HTTP case
  in `int-tests/` or a browser case in `e2e/`. Do not ask for a one-off harness;
  ask for a case there.
- **An `int-tests/` case of client behaviour** (custom element upgrade, fragment
  swap, form intercept, History API). That is `e2e/`. HTTP cases stay on the
  response; they cannot see whether the element upgraded.
- **`@astral/astral` as a framework runtime dependency.** It is a test
  dependency of `e2e/` only. Do not ask to vendor it, or any other test dep,
  with `"vendor": true`.
- **Exporting a private helper so a unit test can import it.** Cover the public
  function or an HTTP case. Do not ask for an IO seam to make that helper
  reachable.
- **Several asserts on one input.** That is covering a flow. Do not ask to split
  them.

## Conventions

These match `.cursor/rules/conventions.mdc`. They live here because Bugbot
cannot see project rules.

- Deno with JSR specifiers. `deno.lock` is frozen. Ranges in `deno.json` are
  intentional. Test deps (`@std/assert`, `@b-fuze/deno-dom`, `@astral/astral`)
  are lockfile plus `DENO_DIR` cache. Runtime deps (none today) are copied into
  the repo as source and imported via a local path when one exists. Do not turn
  `"vendor": true` back on, add an empty `third_party/`, or use git subtree.
- Tests use `Deno.test` and `@std/assert`.
- `deno check` is the type-check command. It covers the framework, scripts,
  example apps, and `jsx-tests/`.
- Cross-directory imports go through that directory's `mod.ts`. Flag an import
  of a sibling file (`routing/pipeline.ts`, `shared/shared_types.ts`). `mod.ts`
  is the server surface; client runtime modules are imported by file
  (`forms/submit_client.ts`).
- A known static `.json` file is imported with `{ type: "json" }`. Flag
  `readTextFile` + `JSON.parse` of a file that is part of the checkout. Runtime
  payloads (request bodies, webhook events) stay `JSON.parse`.
- Root `deno.json` `imports` may map a bare specifier to a dependency, never to
  a path inside the package. Flag `"./…"`, `"../…"`, or `"/…"` values there.
  Workspace members mapping `dashi` to the checkout are fine. Flag a re-added
  `compilerOptions.jsxImportSource` on the root config.
- A `*_route.ts(x)` module exports route handlers only, and only the route table
  imports from it. Flag application code that calls a handler, including as a
  JSX child: it skips the target's middleware and error boundary, applies its
  cache policy to the caller's response, and leaves it reading the caller's
  `ctx`. Shared markup is a component in a non-route module; another route's
  rendered output is `<RouteFragment src>`.
- Client JS attaches only via `client.module` / `client.element` at module
  scope. App files are `*_client.ts` beside the registrar. Browser-safe APIs
  import from `dashi/client`; client modules do not import `dashi`. Compiled
  files are `/_dashi/client/` via a reserved table route (flat
  `/_dashi/client/<name>-<hash>.js`). Relative imports are rewritten to the
  bundler path; the import map is bundler path → that public URL. Documents get
  one import map; a module script is added only when a host rendered. A lazy
  fragment `import()`s its `Link` modulepreloads before swap. `staticFile` is
  app-mounted disk files. Flag a second include, bundle, or inject path.
  `/_dashi/*` is reserved. `client/mod.ts` is the compiler;
  `client/registry_client.ts` is the browser bus. One document-level submit
  listener in `forms/` owns interception. There is no per-element submit
  listener and no nearest-host targeting. GET navigates the page; a write goes
  through the registry. Client features assume the client runtime. Flag a
  per-element submit listener or a GET form that swaps a fragment.
- A closed set of cases is a `const enum` (plain `enum` only when it must exist
  at runtime). Flag a string-literal union used as a discriminant.
- Fragment updates are `fragment.replace`, `fragment.append`, and
  `fragment.remove` on one primitive, targeting every `route-fragment` with that
  `src`. Write handlers return that list or a Response, not markup or a 2xx
  `text/html` document. `route-action` is the wire format, not a user-writable
  element. Flag a second update path, targeting by DOM id, or a write that
  returns JSX.
- An object shape is an `interface`. `type` is for unions, aliases, mapped
  types. Flag an object shape written as a `type`.
- Flag a helper that is a short, obvious check or a few straightforward lines
  used once. Inline those. A longer or non-obvious body may be a function at one
  call site.
- Do not chain ternary operators. Flag a nested `? :`.
- Do not use `as` to silence the checker. An assertion is allowed when the types
  cannot express the fact, and only at the use that needs it, with a note saying
  why. Flag a cast that can go away by restructuring, or that sits on a
  declaration instead of the use.
