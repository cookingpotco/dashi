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
  _zero_ — the only external import in the repo is `@std/assert` in test files.
  A new runtime dependency is a significant decision, not an implementation
  detail.
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
  that belongs to COO-38. Do not ask for a one-off end-to-end harness.
- **Several asserts on one input.** That is covering a flow. Do not ask to split
  them.
- **The known defects listed below.** They are tracked, and restating them is
  noise.

## Known and tracked

These are real problems with owning issues. Do not report them as new findings.
**Do** flag a change that touches one of them without fixing it, or that
introduces a new instance of the same class elsewhere.

| Location                  | Defect                                                                                                       | Issue     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | --------- |
| `ssr/mod.ts`              | `RenderStorage` is a process-wide singleton re-inited per request, so concurrent requests corrupt each other | COO-7     |
| `routing/mod.ts`          | Middleware chain runs via `forEach` over an async callback, so it is never awaited                           | COO-9     |
| `routing/mod.ts`          | 404 is a bare `Response`; a throw during render is unhandled                                                 | COO-16    |
| `routing/mod.ts`          | Hardcoded `favicon.ico` check standing in for static asset serving                                           | COO-17    |
| `fs/mod.ts`               | `getModuleInstance` takes `Object.keys(mod)[0]` and calls `new` on it, so routing depends on export order    | COO-13    |
| `client/routeFragment.ts` | Never bundled or served, so it is currently dead code                                                        | COO-18    |
| `deno.json` (all three)   | The `dev` task has no permission flags and relies on interactive prompts                                     | untracked |

## Conventions

- Deno with JSR specifiers. Remote modules live in `vendor/`; `deno.lock` is
  frozen. Ranges in `deno.json` are intentional.
- Tests use `Deno.test` and `@std/assert`.
- `deno check` is the type-check command. It covers the framework, scripts, and
  example apps.
