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
  _zero_ — the only external imports in the repo are `@std/assert` and
  `@std/testing` in test files. A new runtime dependency is a significant
  decision, not an implementation detail.
- **Type assertions and `any` that hide real errors** rather than expressing
  something the compiler cannot see.
- **A behaviour change with no test covering it.** Flag that. Do not demand a
  unit test of glue code when a black-box assertion on the output would cover
  it.

## Do not flag

- **Formatting.** `deno fmt` is authoritative. Never comment on style, spacing,
  or line breaks.
- **Missing `key` props in JSX.** There is no VDOM. `jsx-key` is off.
- **Anything in `jsx-runtime/dom_types.ts`** beyond correctness bugs. It is 1619
  lines of vendored, React-derived typings scheduled for deletion in COO-35. Do
  not suggest restructuring it.
- **A missing unit test of routing, SSR, or other glue** when the change is
  already visible in rendered HTML, or when the right coverage is an HTTP case
  that belongs to COO-38. Do not ask for a one-off end-to-end harness.
- **The known defects listed below.** They are tracked, and restating them is
  noise.

## Known and tracked

These are real problems with owning issues. Do not report them as new findings.
**Do** flag a change that touches one of them without fixing it, or that
introduces a new instance of the same class elsewhere.

| Location                   | Defect                                                                                                               | Issue     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------- |
| `jsx-runtime/dom_types.ts` | React-derived typings, licensing and accuracy both unresolved                                                        | COO-35    |
| `ssr/mod.ts`               | `RenderStorage` is a process-wide singleton re-inited per request, so concurrent requests corrupt each other         | COO-7     |
| `ssr/mod.ts`               | `replaceInlineFragmentSlots` discards the result of `replaceAll` and is not awaited, making inline fragments a no-op | COO-8     |
| `routing/mod.ts`           | Middleware chain runs via `forEach` over an async callback, so it is never awaited                                   | COO-9     |
| `routing/mod.ts`           | 404 is a bare `Response`; a throw during render is unhandled                                                         | COO-16    |
| `routing/mod.ts`           | Hardcoded `favicon.ico` check standing in for static asset serving                                                   | COO-17    |
| `fs/mod.ts`                | `getModuleInstance` takes `Object.keys(mod)[0]` and calls `new` on it, so routing depends on export order            | COO-13    |
| `client/routeFragment.ts`  | Never bundled or served, so it is currently dead code                                                                | COO-18    |
| `deno.json` (all three)    | The `dev` task has no permission flags and relies on interactive prompts                                             | untracked |

## Conventions

- Deno with JSR specifiers. Dependency versions are pinned by `deno.lock`;
  ranges in `deno.json` are intentional.
- Tests use `describe`/`it` from `@std/testing/bdd` and `@std/assert`.
- `deno check` is the type-check command. It covers the framework, scripts, and
  example apps.
