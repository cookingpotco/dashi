# Implementing in this repo

You implement Linear issues. The approved plan is the Linear comment that
started you; that and this file are the brief. Skip the `plan-ticket` skill.

## Start

Do not set Linear status. Opening the draft PR on init moves the ticket to
`In Progress`; the GitHub integration handles `In Review` and `Done` after that.

## Done

Follow the `pr-handoff` skill every time you hand the PR back, including after
review follow-up. If that skill is not already available, read
`.cursor/skills/pr-handoff/SKILL.md` and follow it.

## Tests

Every behaviour change is covered at the layer that actually runs:

- Pure functions: `Deno.test` next to the module
- Markup: compiled JSX
- HTTP (status, headers, HTML bytes / parsed response): `int-tests/`
- Live DOM after JS (custom element upgrade, fetch, swap, History): `e2e/`

**The path that happens.** Drive real inputs through the public surface a user
or the compiler hits. Do not stub, mock, or stand up a narrower entry point to
approximate a flow whose natural test is further out. If that outer layer is
HTTP, add a case in `int-tests/` — declarative when it is one request, or a
`t.step` on the same harness helpers when it is not. If that outer layer is the
live document after JS, add a case in `e2e/`. Do not invent a second harness. Do
not export a private helper so a unit test can import it, and do not inject a
fake filesystem to unit-test a function whose real path is `Deno.open`.
Constructing a `Request` or `Ctx` to call a route handler is a narrower entry
point; if the user hits it over HTTP, the case belongs in `int-tests/`.

**Don't test what never happens.** A situation the product never produces is not
coverage.

**One flow per test.** Cover as much of that flow as will hold. Several asserts
on one input are right; running the same input again for each detail of the
output is not. Unrelated flows stay in separate tests so a failure names the
path and an early assert cannot hide another.

**Black-box.** Assert on what a caller sees (HTML, an HTTP response, a thrown
error), not on routing or SSR internals. For JSX, the outer layer that runs is
compiled JSX (a parallel `jsx()` call for the same markup is the same layer, not
a narrower one).

**Unit tests** only for functions that are themselves the public surface: the
JSX runtime exports, escaping, anything a caller imports. A helper that exists
only to serve that surface is not a second test suite. Other modules do not get
a parallel suite of that density.

Do not add a second HTTP harness; extend `int-tests/`. Do not put a browser
runner in `int-tests/`, and do not re-assert HTTP in `e2e/`.

## Simpler

Prefer the simpler version, even when it repeats a few lines. Extract a helper
when the code is not obvious, or when the same non-trivial shape is repeated. A
short, unmistakable check used twice stays inline. A longer or non-obvious body
is a function even at one call site. If the plan specified machinery you then
see is unnecessary, leave it out and list it under **Plan deviations** in the
handoff comment. Leave the Linear plan as it is.

## One way

One way to do a thing. A second API, alias, or overlapping concept has to
justify why it is not the first. If it cannot, it does not ship. Users should
not have to choose, and the codebase should not end up mixed.

`class` and `className` as equivalent props is two ways to set one attribute;
keep one. Overlapping concepts must either collapse or come out with a
distinction no caller can miss.

If the plan specified a twin you then see is the same job, ship the one way and
list it under **Plan deviations**.

A method handler is the resource: JSX, a `Response`, or a helper like
`staticFile(ctx, dir, relative)` called from `{ GET }`. The relative path is the
route param the caller passes in. Middleware is a factory attached on `group()`,
like `cors`. Those are different jobs. Do not turn a handler helper into
middleware to match the other shape, and do not call middleware from inside a
handler to skip the onion.

## Reviews

Code-level feedback arrives as a **submitted** GitHub review. Follow the
`pr-followup` skill. A later `@Cursor` on Linear starts a new agent from `main`,
which cannot see the branch.

## Constraints

The repo has no runtime dependencies. Keep it that way. Use the Cursor Cloud
Agents **v1** REST API if you touch `scripts/review_followup.ts`; v1 rejects
`branchName`.
