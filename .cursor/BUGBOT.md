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
- **The known defects listed below.** They are tracked, and restating them is
  noise.

## Known and tracked

These are real problems with owning issues. Do not report them as new findings.
**Do** flag a change that touches one of them without fixing it, or that
introduces a new instance of the same class elsewhere.

| Location                | Defect                                                                   | Issue     |
| ----------------------- | ------------------------------------------------------------------------ | --------- |
| `deno.json` (all three) | The `dev` task has no permission flags and relies on interactive prompts | untracked |

## Conventions

These match `.cursor/rules/conventions.mdc`. They live here because Bugbot
cannot see project rules.

- Deno with JSR specifiers. `deno.lock` is frozen. Ranges in `deno.json` are
  intentional. Test deps (`@std/assert`, `@b-fuze/deno-dom`, `@astral/astral`)
  are lockfile plus `DENO_DIR` cache. Runtime deps (none today) are copied into
  the repo as source and imported via a local path when one exists. Do not turn
  `"vendor": true` back on, add an empty `third_party/`, or use git subtree.
- Tests use `Deno.test` and `@std/assert`.
- `deno check` is the type-check command. It covers the framework, scripts, and
  example apps.
- Cross-directory imports go through that directory's `mod.ts`. Flag an import
  of a sibling file (`routing/pipeline.ts`, `shared/shared_types.ts`).
- Client JS attaches only via `client.module` / `client.element` at module
  scope. App files are `*_client.ts` beside the registrar. Compiled files are
  `/_dashi/client/` via a reserved table route (flat
  `/_dashi/client/<name>-<hash>.js`). Import-map keys are bundler paths and
  relatives resolved against the flat URL; values are those public URLs.
  Documents get one import map; a module script is added only when a host
  rendered. `staticFile` is app-mounted disk files. Flag a second include,
  bundle, or inject path. `/_dashi/*` is reserved.
- A closed set of cases is a `const enum` (plain `enum` only when it must exist
  at runtime). Flag a string-literal union used as a discriminant.
- An object shape is an `interface`. `type` is for unions, aliases, mapped
  types. Flag an object shape written as a `type`.
- Flag a helper that is a short, obvious check or a few straightforward lines
  used once. Inline those. A longer or non-obvious body may be a function at one
  call site.
- Do not use `as` to silence the checker. An assertion is allowed when the types
  cannot express the fact, and only at the use that needs it, with a note saying
  why. Flag a cast that can go away by restructuring, or that sits on a
  declaration instead of the use.
