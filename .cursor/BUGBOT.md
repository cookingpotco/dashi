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
  _zero_ — test files import `@std/assert`, and `int-tests/` also imports
  `@b-fuze/deno-dom`. A new runtime dependency is a significant decision, not an
  implementation detail.
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
  in `int-tests/`. Do not ask for a one-off harness; ask for a case there.
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

| Location                  | Defect                                                                   | Issue     |
| ------------------------- | ------------------------------------------------------------------------ | --------- |
| `client/routeFragment.ts` | Never bundled or served, so it is currently dead code                    | COO-18    |
| `deno.json` (all three)   | The `dev` task has no permission flags and relies on interactive prompts | untracked |

## Conventions

These match `.cursor/rules/conventions.mdc`. They live here because Bugbot
cannot see project rules.

- Deno with JSR specifiers. Remote modules live in `vendor/`; `deno.lock` is
  frozen. Ranges in `deno.json` are intentional.
- Tests use `Deno.test` and `@std/assert`.
- `deno check` is the type-check command. It covers the framework, scripts, and
  example apps.
- Cross-directory imports go through that directory's `mod.ts`. Flag an import
  of a sibling file (`routing/pipeline.ts`, `shared/shared_types.ts`).
- A closed set of cases is a `const enum` (plain `enum` only when it must exist
  at runtime). Flag a string-literal union used as a discriminant.
- An object shape is an `interface`. `type` is for unions, aliases, mapped
  types. Flag an object shape written as a `type`.
- Flag a helper that is a short, unmistakable check (or a one-off of a few
  obvious lines). A longer or non-obvious body may be a function at one call
  site.
